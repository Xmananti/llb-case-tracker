# 🔧 Case Visibility Fix

## Problem

Cases were not showing up because:

1. **Legacy cases** (created before multi-tenancy) don't have `organizationId`
2. **Filtering logic** was too strict - excluded legacy cases when user had organizationId
3. **Users without organization** couldn't see any cases

## Solution

### Updated Filtering Logic

The `/api/cases/list` route now handles three scenarios:

#### Scenario 1: User HAS organizationId

- ✅ Shows cases with matching `organizationId`
- ✅ Shows legacy cases (no `organizationId`) that belong to the user
- ❌ Excludes cases with different `organizationId`

#### Scenario 2: User has NO organizationId

- ✅ Shows legacy cases (no `organizationId`) that belong to the user
- ❌ Excludes cases with `organizationId`

#### Scenario 3: User doesn't exist in database

- Returns empty array `[]`

### Migration Endpoint

Created `/api/cases/migrate` to help migrate legacy cases:

```typescript
POST /api/cases/migrate
{
  "userId": "user-123",
  "organizationId": "org-456"
}
```

This will:

- Find all cases for the user that don't have `organizationId`
- Assign them to the organization
- Update organization case count

## How to Use

### For Existing Users with Cases

1. **Option A: Automatic (Recommended)**

   - Cases will show up automatically (legacy cases visible)
   - User can continue working normally
   - Migrate cases later when ready

2. **Option B: Migrate Immediately**
   ```typescript
   // Call migration endpoint
   POST /api/cases/migrate
   {
     "userId": "your-user-id",
     "organizationId": "your-org-id"
   }
   ```

### For New Users

- Users must be assigned to an organization
- Cases created will automatically have `organizationId`
- No migration needed

## Testing

1. **Test with legacy cases:**

   - User with organizationId should see both:
     - New cases (with organizationId)
     - Old cases (without organizationId, but belong to user)

2. **Test without organization:**

   - User without organizationId should see:
     - Only legacy cases (without organizationId)

3. **Test migration:**
   - Call migration endpoint
   - Verify cases get `organizationId` assigned
   - Verify organization case count updates

## Next Steps

- Cases should now be visible
- Legacy cases will show for users with organizations
- Consider running migration for all users to fully migrate to multi-tenancy
