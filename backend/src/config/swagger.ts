import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SplitEase API',
      version: '1.0.0',
      description:
        'REST API documentation for the SplitEase expense-splitting platform. Use the Authorize button to set your JWT Bearer token for protected endpoints.',
      contact: {
        name: 'SplitEase Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:{port}',
        description: 'Local development server',
        variables: {
          port: {
            default: '5000',
          },
        },
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token returned from /api/auth/login',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50, example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 1, example: 'secret123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Authentication successful' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                  },
                },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
              },
            },
          },
        },

        // ── Groups ───────────────────────────────────────
        CreateGroupRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100, example: 'Weekend Trip' },
          },
        },
        JoinGroupRequest: {
          type: 'object',
          required: ['inviteCode'],
          properties: {
            inviteCode: { type: 'string', example: 'abc123xyz' },
          },
        },
        InviteUserRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'friend@example.com' },
          },
        },

        // ── Expenses ─────────────────────────────────────
        CreateExpenseRequest: {
          type: 'object',
          required: ['groupId', 'description', 'totalAmount', 'participants'],
          properties: {
            groupId: { type: 'integer', example: 1 },
            description: { type: 'string', maxLength: 255, example: 'Dinner at restaurant' },
            totalAmount: { type: 'number', example: 2500 },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                required: ['userId', 'shareAmount'],
                properties: {
                  userId: { type: 'integer', example: 2 },
                  shareAmount: { type: 'number', example: 1250 },
                },
              },
            },
            payers: {
              type: 'array',
              items: {
                type: 'object',
                required: ['userId', 'amountPaid'],
                properties: {
                  userId: { type: 'integer', example: 1 },
                  amountPaid: { type: 'number', example: 2500 },
                },
              },
            },
          },
        },
        UpdateExpenseRequest: {
          type: 'object',
          required: ['groupId'],
          properties: {
            groupId: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'Updated dinner' },
            totalAmount: { type: 'number', example: 3000 },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'integer', example: 2 },
                  shareAmount: { type: 'number', example: 1500 },
                },
              },
            },
            payers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'integer', example: 1 },
                  amountPaid: { type: 'number', example: 3000 },
                },
              },
            },
          },
        },

        // ── Settlements ──────────────────────────────────
        CreateSettlementRequest: {
          type: 'object',
          required: ['groupId', 'payeeId', 'amount'],
          properties: {
            groupId: { type: 'integer', example: 1 },
            payeeId: { type: 'integer', example: 2 },
            amount: { type: 'number', example: 500 },
          },
        },

        // ── Generic ──────────────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Something went wrong' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
  },
  // Scan all route files for JSDoc annotations
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
