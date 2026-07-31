# Activity and Settings Pages - Implementation Plan

This plan details the steps required to build out the global **Activity** timeline and the user **Settings** configuration panel.

## Proposed Changes

### 1. Database & Backend Updates
- **Update Prisma Schema**: Add `defaultCurrency` (String, default "Rs.") and `paymentMethod` (String, optional) fields to the `User` model.
- **New Endpoints**:
  - `GET /api/users/activity`: Fetch a comprehensive, expanded list of user activities across all groups (built off the existing `getDashboardStats` logic but without the 10-item limit).
  - `PUT /api/users/profile`: Endpoint to update the user's name, currency preference, and payment method details.

### 2. Activity Page (`frontend/src/pages/Activity.tsx`)
- Create a dedicated React component for the Activity page.
- Fetch the expanded activity feed from the new API.
- Render a beautiful, chronological timeline UI using `lucide-react` icons to differentiate between Expenses (Receipt) and Settlements (Credit Card).

### 3. Settings Page (`frontend/src/pages/Settings.tsx`)
- Create a dedicated React component for user settings.
- Build a structured form with the following sections:
  - **Profile Information**: Update Name.
  - **Payment Preferences**: Add/Edit `paymentMethod` (e.g., "EasyPaisa: 0300-1234567").
  - **Account Preferences**: Select `defaultCurrency`.
- Wire up the form to the new `PUT /api/users/profile` endpoint, complete with our new `react-hot-toast` notifications for success/errors.

### 4. Routing Updates (`frontend/src/App.tsx`)
- Add `<Route path="activity" element={<Activity />} />`
- Add `<Route path="settings" element={<Settings />} />`

## Verification Plan
1. Push Prisma schema changes and restart the backend.
2. Navigate to `/settings`, update the user's payment method and name, and verify the changes save and persist on refresh.
3. Navigate to `/activity` and verify that the full list of historical transactions across groups loads correctly.

> [!IMPORTANT]
> **Open Question for You**: Are you okay with adding the `paymentMethod` and `defaultCurrency` fields to the database right now? This will make the app feel much more like a real product!
