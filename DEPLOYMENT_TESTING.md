# Deployment & Testing Guide

## Pre-Deployment Checklist

### Environment Setup

- [ ] Verify `.env` file contains all Cloudinary variables:
  ```
  CLOUDINARY_CLOUD_NAME=xxx
  CLOUDINARY_API_KEY=xxx
  CLOUDINARY_API_SECRET=xxx
  CLOUDINARY_URL=cloudinary://...
  ```
- [ ] Verify MongoDB connection string is working
- [ ] Verify Clerk authentication is configured
- [ ] Run `npm install cloudinary` (if not already installed)

### Code Review

- [ ] Review `/src/app/api/pets/upload/route.js` for security
- [ ] Verify authentication checks on upload API
- [ ] Verify pet ownership validation works
- [ ] Check file type validation is correct
- [ ] Review error handling messages

### Database

- [ ] Verify Pet model has `profileImage` field
- [ ] Verify Pet model has `medicalRecords` array field
- [ ] Test MongoDB connection works
- [ ] Check existing pet data (should not be affected)

## Local Testing

### 1. Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000`

### 2. Basic Flow Testing

#### Test: Create Pet with Profile Picture

1. Click "Add Pet"
2. Fill Step 1: All required fields
3. Click "Next"
4. Step 2: Upload an image file
5. Verify preview displays
6. Click "Next"
7. Step 3: Skip (don't upload medical records)
8. Click "Create Pet"
9. Verify: Pet appears in list with profile picture

#### Test: Create Pet with Medical Records

1. Click "Add Pet"
2. Fill Step 1: All required fields
3. Click "Next"
4. Step 2: Skip (no profile picture)
5. Click "Next"
6. Step 3:
   - Add description: "Vaccination Records"
   - Upload a PDF file
   - Verify appears in preview list
   - Add another record with image
7. Click "Create Pet"
8. Verify: Pet appears with medical records count

#### Test: Create Complete Pet

1. Click "Add Pet"
2. Fill all Step 1 fields
3. Click "Next"
4. Step 2: Upload image with preview
5. Click "Next"
6. Step 3: Upload 2-3 medical records
7. Click "Create Pet"
8. Verify: All data saved correctly

### 3. File Type Validation Testing

#### Invalid Profile Picture

1. Step 2: Try to upload a PDF file
2. Verify error: "Please upload an image file"

#### Invalid Medical Record

1. Step 3: Try to upload an EXE or unsupported file
2. Verify error: "Please upload a PDF, DOC, DOCX, or image file"

### 4. Edit Functionality Testing

#### Test: Edit Pet

1. Click Edit (✏️) on existing pet
2. Form opens with existing data
3. Modify fields
4. Change profile picture
5. Add new medical records
6. Click "Update Pet"
7. Verify changes saved

#### Test: Edit Pet with Existing Picture

1. Click Edit on pet with profile picture
2. Verify picture displays in preview
3. Replace with new image
4. Verify old image replaced

### 5. UI/UX Testing

#### Step Indicator

- [ ] Step 1: Shows as blue circle with "1"
- [ ] Step 1→2: Circle 1 shows checkmark, line fills
- [ ] Step 2: Circle 2 is blue
- [ ] Step 2→3: Circle 2 shows checkmark, line fills
- [ ] Step 3: Circle 3 is blue
- [ ] Labels show correct text for each step

#### Navigation Buttons

- [ ] Step 1: Shows "Next" button
- [ ] Step 2: Shows "Back" and "Next"
- [ ] Step 3: Shows "Back" and "Create Pet"
- [ ] All steps: Show "Cancel" button
- [ ] Can navigate back and forward

#### Loading States

- [ ] Profile picture upload shows spinner
- [ ] Medical record upload shows spinner
- [ ] Buttons disabled during upload
- [ ] Loading completes and clears

### 6. Mobile Testing

Test on mobile device or browser dev tools (375px width):

- [ ] Form is readable
- [ ] File inputs work
- [ ] Preview images resize correctly
- [ ] Buttons are clickable
- [ ] Pet cards stack vertically
- [ ] Medical records list is readable

### 7. Error Handling Testing

#### Network Error

1. Disconnect internet temporarily
2. Try to upload file
3. Verify error message appears

#### Missing File

1. Click upload button
2. Cancel file selection
3. Verify form remains open

#### Invalid File Size

Test with very large files (>100MB):

- Verify Cloudinary handles gracefully

### 8. MongoDB Data Testing

After creating pets with uploads, check MongoDB:

```javascript
// Use MongoDB shell or tool to verify:

// View pet document
db.pets.findOne({ name: "TestPet" })

// Should show:
{
  _id: ObjectId,
  name: "TestPet",
  profileImage: "https://cloudinary.com/...",
  medicalRecords: [
    {
      fileName: "...",
      fileUrl: "https://cloudinary.com/...",
      uploadedAt: ISODate,
      description: "..."
    }
  ]
}

// Verify URLs are HTTPS (secure)
// Verify all URLs are valid Cloudinary URLs
// Verify no local file paths in database
```

### 9. Cloudinary Verification

Check Cloudinary dashboard:

- [ ] Files appear in correct folders:
  - `pet-care-app/profile-pictures/`
  - `pet-care-app/medical-records/`
- [ ] Profile pictures are optimized (500x500)
- [ ] Medical records maintain original quality
- [ ] File names are correct
- [ ] Upload dates are recent

## Performance Testing

### File Upload Performance

#### Small Files (< 1MB)

- Profile picture (500KB image): Should upload in < 2 seconds
- Medical record (PDF 800KB): Should upload in < 3 seconds

#### Large Files (1MB - 10MB)

- Monitor upload progress
- Verify no timeout errors
- Check network requests in DevTools

### UI Responsiveness

- [ ] No UI freeze during file selection
- [ ] Form remains responsive during upload
- [ ] Can close form while uploading (graceful cancel)

## Security Testing

### Authentication

1. Log out of application
2. Try to access upload API directly: `/api/pets/upload`
3. Verify returns 401 Unauthorized

### Authorization

1. Create pet in one account
2. Switch to different account
3. Try to edit or upload to other account's pet
4. Verify returns 404 or Unauthorized

### File Type Security

1. Try to upload executable (.exe, .sh)
2. Verify blocked by validation
3. Try to upload script file (.js, .py)
4. Verify blocked

## Browser Compatibility

Test on:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Staging Deployment

Before production release:

### 1. Deploy to Staging

```bash
# Push to staging branch
git push staging main

# Deploy to staging environment
# (Follow your deployment process)
```

### 2. Run Staging Tests

- Repeat all local tests on staging
- Test with production-like data volume
- Monitor server logs for errors
- Check Cloudinary usage

### 3. Performance Monitoring

- Monitor upload speeds
- Check API response times
- Monitor database queries
- Check error rates

### 4. Load Testing

```bash
# Optional: Use tools like:
# - Apache JMeter
# - Postman Collections
# - K6 load testing

# Test concurrent uploads
# Test multiple users creating pets
# Monitor server resources
```

## Production Deployment

### Pre-Production

1. Final security review
2. Backup MongoDB
3. Verify all environment variables
4. Test rollback procedure

### Deployment Steps

```bash
# 1. Deploy code
git push main

# 2. Verify deployment successful
# Visit production site
# Test key flows

# 3. Monitor logs
# Check for errors in first hour

# 4. Gradual rollout (if possible)
# Enable for 10% of users
# Monitor for issues
# Increase to 100%
```

### Post-Deployment

- [ ] Monitor error logs for 24 hours
- [ ] Check Cloudinary storage usage
- [ ] Verify database performance
- [ ] Get user feedback

## Monitoring & Maintenance

### Ongoing Monitoring

```
Daily:
- Check error logs
- Verify API endpoints responding
- Monitor upload success rate

Weekly:
- Review Cloudinary storage usage
- Check database storage growth
- Review user feedback

Monthly:
- Analyze usage patterns
- Verify file storage costs
- Plan capacity for growth
```

### Common Issues & Solutions

#### Issue: Profile picture not showing on pet card

**Solution:**

1. Check Cloudinary URL is HTTPS
2. Verify URL format is correct
3. Check CORS settings on Cloudinary
4. Verify MongoDB contains URL

#### Issue: Upload takes too long

**Solution:**

1. Check file size (< 50MB recommended)
2. Check internet connection
3. Check Cloudinary account limits
4. Review server logs

#### Issue: Medical records not showing count

**Solution:**

1. Verify medicalRecords array exists
2. Check array length is not zero
3. Verify UI code is correct
4. Check browser console for errors

#### Issue: Can't upload medical record

**Solution:**

1. Verify file type is supported
2. Check file size < 100MB
3. Verify Cloudinary quota
4. Check server logs for errors

## Rollback Procedure

If issues occur in production:

1. Revert code to previous version
2. Monitor for 1 hour
3. If successful, keep reverted version
4. Investigate issues offline
5. Fix and test thoroughly
6. Re-deploy

```bash
# Rollback command
git revert <commit-hash>
git push main
```

## User Communication

### If Issues Occur

1. Inform users of temporary limitation
2. Provide timeline for fix
3. Offer workaround if possible
4. Update status when resolved

### New Feature Announcement

```
"🎉 New Feature: File Uploads!

Upload your pet's profile picture and medical
records directly in the pet management form.
All files are securely stored in the cloud.

Features:
✓ Pet profile pictures (auto-optimized)
✓ Medical records (PDF, Word, Images)
✓ Multi-step form wizard
✓ Easy management

Learn more: [docs link]"
```

## Success Metrics

Track these metrics after deployment:

- [ ] Upload success rate > 98%
- [ ] Average upload time < 3 seconds
- [ ] Zero security incidents
- [ ] No data loss
- [ ] User satisfaction > 4/5
- [ ] Error rate < 0.5%
- [ ] API uptime > 99.9%

## Documentation Updates

After successful deployment:

- [ ] Update user documentation
- [ ] Create video tutorial
- [ ] Update help articles
- [ ] Add FAQ section
- [ ] Document known issues
- [ ] Create troubleshooting guide
