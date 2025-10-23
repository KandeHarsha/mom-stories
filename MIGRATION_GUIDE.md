# Baby to Children Migration Guide

## Overview
This guide documents the renaming of "baby/babies" to "child/children" throughout the application, including database collection changes.

## Database Changes

### Firestore Collection Rename
The Firestore collection has been renamed:
- **Old:** `babies`
- **New:** `children`

### Migration Steps for Existing Data

To migrate your existing data in Firestore, you'll need to:

1. **Copy data from `babies` to `children` collection:**
   - Read all documents from the `babies` collection
   - Write them to the new `children` collection
   - Update user profiles to reference `childId` instead of `babyId`

2. **Update user profiles:**
   - Change the `babyId` field to `childId` in all user profile documents

3. **Delete old collection (optional):**
   - Once migration is verified, you can delete the old `babies` collection

### Example Migration Script (Firebase Admin SDK)
```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function migrateBabiesToChildren() {
  // Get all documents from babies collection
  const babiesSnapshot = await db.collection('babies').get();
  
  const batch = db.batch();
  
  // Copy to children collection
  babiesSnapshot.forEach(doc => {
    const childRef = db.collection('children').doc(doc.id);
    batch.set(childRef, doc.data());
  });
  
  await batch.commit();
  console.log('Migration complete!');
}

async function updateUserProfiles() {
  const usersSnapshot = await db.collection('userProfiles').get();
  
  const batch = db.batch();
  
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.babyId) {
      const userRef = db.collection('userProfiles').doc(doc.id);
      batch.update(userRef, {
        childId: data.babyId,
        babyId: admin.firestore.FieldValue.delete()
      });
    }
  });
  
  await batch.commit();
  console.log('User profiles updated!');
}
```

## Code Changes Summary

### Files Renamed
- `src/services/baby-service.ts` → `src/services/child-service.ts`

### API Routes Changed
- `/api/babies/[babyId]/route.ts` → `/api/children/[childId]/route.ts`
- `/api/babies/[babyId]/measurements/route.ts` → `/api/children/[childId]/measurements/route.ts`

### Type/Interface Changes
- `BabyProfile` → `ChildProfile`
- `CreateBabyProfileInput` → `CreateChildProfileInput`
- `babyId` → `childId` (in UserProfile interface)

### Function Changes
- `createBabyProfile()` → `createChildProfile()`
- `getBabyProfile()` → `getChildProfile()`
- Parameter names: `babyId` → `childId`

### UI Changes
- All user-facing text updated from "baby" to "child"
- Form labels and placeholders updated
- Tab labels: "Baby Growth" → "Child Growth", "Baby Vaccinations" → "Child Vaccinations"
- Dialog titles and descriptions updated

### Component Variable Changes
In `health-tracker-view.tsx`:
- `babyProfile` → `childProfile`
- `babyName` → `childName`
- `babyBirthday` → `childBirthday`
- `babyWeight` → `childWeight`
- `babyHeight` → `childHeight`
- `babyGender` → `childGender`
- `babyChartConfig` → `childChartConfig`
- `babyGrowthData` → `childGrowthData`

## Testing Checklist

After migration, verify:
- [ ] Child profile creation works
- [ ] Child profile retrieval works
- [ ] Measurement addition works
- [ ] Growth charts display correctly
- [ ] User profile correctly stores `childId`
- [ ] All UI text displays "child" instead of "baby"
- [ ] API endpoints respond correctly at `/api/children/*`

## Rollback Plan

If you need to rollback:
1. Restore the old `baby-service.ts` file
2. Restore the old API routes under `/api/babies/`
3. Revert the UserProfile interface to use `babyId`
4. Revert all component changes
5. Keep the `babies` collection in Firestore
