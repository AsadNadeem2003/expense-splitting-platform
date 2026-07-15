import prisma from '../config/prisma';
import { generateInviteCode } from '../utils/inviteCode';
import { CreateGroupInput } from '../validators/group.schema';

export const createGroup = async (userId: number, data: CreateGroupInput) => {
  const inviteCode = await generateInviteCode();

  return prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name: data.name,
        createdById: userId,
        inviteCode,
        members: {
          create: {
            userId,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    });
    return group;
  });
};

export const joinGroup = async (userId: number, inviteCode: string) => {
  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) throw new Error('Invalid invite code');

  const existingRequest = await prisma.pendingJoinRequest.findUnique({
    where: { groupId_userId: { groupId: group.id, userId } }
  });
  if (existingRequest && existingRequest.status === 'PENDING') {
    throw new Error('You already have a pending request to join this group');
  }

  return prisma.pendingJoinRequest.upsert({
    where: { groupId_userId: { groupId: group.id, userId } },
    update: { status: 'PENDING' },
    create: { groupId: group.id, userId, status: 'PENDING' }
  });
};

export const approveRequest = async (adminId: number, groupId: number, requestId: number) => {
  const adminMembership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: adminId } }
  });
  if (!adminMembership || adminMembership.role !== 'ADMIN') {
    throw new Error('Only group admins can approve requests');
  }

  const request = await prisma.pendingJoinRequest.findUnique({ where: { id: requestId } });
  if (!request || request.groupId !== groupId || request.status !== 'PENDING') {
    throw new Error('Invalid or already processed request');
  }

  return prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.pendingJoinRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' }
    });

    await tx.groupMember.create({
      data: { groupId, userId: request.userId, role: 'MEMBER' }
    });

    return updatedRequest;
  });
};

export const rejectRequest = async (adminId: number, groupId: number, requestId: number) => {
  const adminMembership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: adminId } }
  });
  if (!adminMembership || adminMembership.role !== 'ADMIN') {
    throw new Error('Only group admins can reject requests');
  }

  const request = await prisma.pendingJoinRequest.findUnique({ where: { id: requestId } });
  if (!request || request.groupId !== groupId || request.status !== 'PENDING') {
    throw new Error('Invalid or already processed request');
  }

  return prisma.pendingJoinRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' }
  });
};

export const inviteUser = async (adminId: number, groupId: number, email: string) => {
  const adminMembership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: adminId } }
  });
  if (!adminMembership || adminMembership.role !== 'ADMIN') {
    throw new Error('Only group admins can invite users directly');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) throw new Error('User not found');

  const existingMember = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } }
  });
  if (existingMember) throw new Error('User is already a member');

  await prisma.groupMember.create({
    data: {
      groupId,
      userId: user.id,
      role: 'MEMBER'
    }
  });

  // Remove any pending join requests if they exist
  await prisma.pendingJoinRequest.deleteMany({
    where: { groupId, userId: user.id }
  });

  return { message: `User ${user.name} has been added to the group` };
};

export const getGroupDetails = async (groupId: number) => {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      pendingRequests: { where: { status: 'PENDING' }, include: { user: { select: { id: true, name: true, email: true } } } }
    }
  });
};

export const getUserGroups = async (userId: number) => {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true } } } }
        }
      }
    }
  });
  return memberships.map(m => m.group);
};

export const leaveGroup = async (userId: number, groupId: number) => {
  return prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } }
  });
};

export const removeMember = async (adminId: number, groupId: number, userIdToRemove: number) => {
  const adminMembership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: adminId } }
  });
  if (!adminMembership || adminMembership.role !== 'ADMIN') {
    throw new Error('Only group admins can remove members');
  }

  if (adminId === userIdToRemove) {
    throw new Error('You cannot remove yourself');
  }

  // Check if member exists
  const memberToRemove = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: userIdToRemove } }
  });

  if (!memberToRemove) {
    throw new Error('User is not a member of this group');
  }

  // Check if they have zero balance
  const { getGroupBalances } = await import('./balance.service');
  const balances = await getGroupBalances(groupId);
  // Allow removing if balance is negligible (less than 1 Rupee / 100 paisa)
  if (balances[userIdToRemove] !== undefined && Math.abs(balances[userIdToRemove]) >= 100) {
    throw new Error('Cannot remove a member with a balance of Rs. 1 or more');
  }

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: userIdToRemove } }
  });

  return { message: 'Member removed successfully' };
};
