# 🚀 SaaS Implementation Guide

## Overview

This application has been converted to a **multi-tenant SaaS platform** where you can onboard law firms and sell subscriptions.

## Architecture

### Multi-Tenancy Model

1. **Organizations (Law Firms)**

   - Each law firm is an organization
   - Organizations have subscription plans
   - Organizations have limits (users, cases)

2. **Users**

   - Users belong to organizations
   - Users have roles (owner, admin, lawyer, assistant, viewer)
   - Users are scoped to their organization

3. **Cases**
   - Cases belong to organizations (not just users)
   - All users in an organization can access organization cases
   - Filtered by `organizationId`

## Subscription Plans

| Plan             | Price   | Users     | Cases     | Features                                  |
| ---------------- | ------- | --------- | --------- | ----------------------------------------- |
| **Free**         | $0      | 1         | 10        | Basic case management, 1GB storage        |
| **Starter**      | $49/mo  | 5         | 100       | 10GB storage, Priority support, Analytics |
| **Professional** | $149/mo | 20        | 500       | 50GB storage, API access, Custom branding |
| **Enterprise**   | $499/mo | Unlimited | Unlimited | Unlimited storage, SSO, SLA               |

## Implementation Status

### ✅ Completed

1. **Organization Types** (`lib/types/organization.ts`)

   - Organization interface
   - Subscription plan definitions
   - User role types

2. **Organization API Routes**

   - `POST /api/organizations/create` - Create new organization
   - `GET /api/organizations/list` - List organizations
   - `GET /api/organizations/[orgId]` - Get organization details
   - `PATCH /api/organizations/[orgId]` - Update organization
   - `PATCH /api/organizations/[orgId]/subscription` - Update subscription

3. **Security**
   - `firebase.json` added to `.gitignore`
   - Template file created (`firebase.json.example`)

### 🚧 Next Steps

1. **Update User Model**

   - Add `organizationId` to user registration
   - Add `role` field to users
   - Update user API routes

2. **Update Case Model**

   - Add `organizationId` to cases
   - Filter cases by organization
   - Update all case API routes

3. **Admin Panel**

   - Create admin dashboard
   - Organization onboarding form
   - Subscription management UI
   - User management per organization

4. **Subscription Middleware**

   - Check subscription status
   - Enforce limits (users, cases)
   - Handle trial expiration
   - Payment integration (Stripe/PayPal)

5. **Update Frontend**
   - Organization selection/creation
   - Subscription plan selection
   - Billing dashboard
   - User role management

## API Usage Examples

### Create Organization (Admin)

```typescript
POST /api/organizations/create
{
  "name": "Smith & Associates Law Firm",
  "email": "contact@smithlaw.com",
  "phone": "+1-555-0123",
  "address": "123 Main St, City, State",
  "subscriptionPlan": "professional",
  "createdBy": "admin-user-id"
}
```

### Update Subscription

```typescript
PATCH /api/organizations/{orgId}/subscription
{
  "subscriptionPlan": "enterprise",
  "subscriptionStatus": "active"
}
```

### Get Organization

```typescript
GET / api / organizations / { orgId };
```

## Database Structure

### Realtime Database

```
organizations/
  {orgId}/
    name: string
    email: string
    subscriptionPlan: "free" | "starter" | "professional" | "enterprise"
    subscriptionStatus: "active" | "trial" | "expired" | "cancelled"
    maxUsers: number
    maxCases: number
    currentUsers: number
    currentCases: number
    ...

users/
  {userId}/
    organizationId: string
    role: "owner" | "admin" | "lawyer" | "assistant" | "viewer"
    ...

cases/
  {caseId}/
    organizationId: string  // NEW
    userId: string
    ...
```

## Security Considerations

1. **Organization Isolation**

   - All queries must filter by `organizationId`
   - Users can only access their organization's data
   - API routes must verify organization membership

2. **Role-Based Access Control**

   - Owners: Full access
   - Admins: Manage users and cases
   - Lawyers: Create/edit cases
   - Assistants: View and edit assigned cases
   - Viewers: Read-only access

3. **Subscription Enforcement**
   - Check subscription status on each request
   - Enforce user limits
   - Enforce case limits
   - Block access if expired

## Payment Integration (Future)

Recommended payment providers:

- **Stripe** - Most popular, great docs
- **PayPal** - Easy integration
- **Paddle** - SaaS-focused

## Next Implementation Steps

1. Update user registration to include organization
2. Update case creation to include organizationId
3. Create admin panel for onboarding
4. Add subscription middleware
5. Implement payment integration
6. Add billing dashboard
