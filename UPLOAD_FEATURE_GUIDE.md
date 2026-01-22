# Pet Management Multi-Step Upload Feature

## Overview

A clean, production-ready implementation of a 3-step pet management form with profile picture and medical records upload functionality using Cloudinary and MongoDB.

## Architecture

### API Routes

#### 1. `/api/pets/upload` (POST)

**Purpose**: Handle file uploads to Cloudinary and save URLs to MongoDB

- Authenticates with Clerk
- Verifies pet ownership via familyProfile
- Uploads files to Cloudinary with type-specific options
- Updates pet document in MongoDB
- Returns secure URLs

**Request Body**:

```json
{
  "file": File,
  "petId": "pet_id_string",
  "uploadType": "profilePicture" | "medicalRecord",
  "description": "optional description for medical records"
}
```

**Response**:

```json
{
  "success": true,
  "url": "cloudinary_secure_url",
  "message": "Upload successful"
}
```

#### 2. `/api/pets/[petId]` (GET, PUT, DELETE)

**Key Points**:

- All route handlers properly await params: `const { petId } = await params;`
- This is required for Next.js 15+ compatibility
- All operations verify user ownership via familyProfile

**GET**: Fetch single pet with all data
**PUT**: Update pet information and metadata
**DELETE**: Remove pet from database

### Component: PetManagement.js

**Multi-Step Form Flow**:

1. **Step 1**: Basic pet information (name, type, breed, age, weight, DOB)
2. **Step 2**: Profile picture upload with preview
3. **Step 3**: Medical records upload (batch with descriptions)

**Key Functions**:

- `handleInputChange()`: Update form data
- `handleProfilePictureUpload()`: Validate and preview image
- `handleMedicalRecordUpload()`: Add medical records to queue
- `uploadFile()`: Upload single file to Cloudinary via API
- `handleSubmit()`: Create/update pet, then upload files
- `handleEdit()`: Load pet data for editing
- `handleDelete()`: Remove pet with confirmation

**State Management**:

- `pets`: Array of pet objects
- `editingPet`: Currently edited pet (null for new)
- `currentStep`: Form wizard step (1-3)
- `medicalRecords`: Queue of files to upload
- `formData`: Pet basic information
- `profilePicturePreview`: Image preview URL
- `uploadingProfilePicture/uploadingMedicalRecords`: Loading states

### Upload Flow

```
Frontend (PetManagement.js)
    ↓
1. User fills form (Step 1)
    ↓
2. User uploads profile picture (Step 2)
    - File preview shown
    - Uploaded to /api/pets/upload after pet creation
    ↓
3. User uploads medical records (Step 3)
    - Files queued with descriptions
    - Each uploaded to /api/pets/upload after pet creation
    ↓
4. User submits form (handleSubmit)
    - POST /api/pets (new) or PUT /api/pets/[petId] (edit)
    - petId captured from response
    ↓
5. Profile picture & medical records uploaded
    - FormData sent to /api/pets/upload
    - Files uploaded to Cloudinary
    - URLs saved to MongoDB
    ↓
Backend (API Routes)
    - Authenticate user with Clerk
    - Verify pet ownership
    - Upload to Cloudinary
    - Update MongoDB
    - Return secure URLs
```

## Key Implementation Details

### File Type Validation

**Profile Picture**:

- Must be image/\* MIME type
- Compressed to 500x500 pixels
- Stored in Cloudinary `/pet-care-app/profile-pictures` folder

**Medical Records**:

- Allowed types: PDF, DOC, DOCX, PNG, JPEG, GIF
- Original quality preserved
- Stored in Cloudinary `/pet-care-app/medical-records` folder
- Can include descriptions for organization

### Next.js 15+ Compatibility

All dynamic route handlers properly await params:

```javascript
export async function GET(req, { params }) {
  const { petId } = await params; // ✓ Correct
  // NOT: const { petId } = params;  // ✗ Wrong in Next.js 15+
}
```

### Security

- **User Authentication**: Clerk auth required for all operations
- **Pet Ownership Verification**: Pets must belong to user's familyProfile
- **File Validation**: Type and size checks on both client and server
- **Secure URLs**: Cloudinary provides secure_url with auto-expiring tokens

### Error Handling

- User-friendly error messages
- Validation at both client and server
- Graceful fallbacks for upload failures
- Loading states during uploads
- Confirmation dialogs for destructive actions

## MongoDB Schema

```javascript
// Pet model includes:
{
  _id: ObjectId,
  name: String,
  animal: String,
  breed: String,
  age: String,
  weight: String,
  dateOfBirth: Date,
  profileImage: String,  // Cloudinary URL
  medicalRecords: [{
    fileName: String,
    fileUrl: String,     // Cloudinary URL
    uploadedAt: Date,
    description: String
  }],
  familyProfileId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables Required

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
MONGODB_URI=your_mongodb_uri
```

## Testing Checklist

- [ ] Add new pet with all steps
- [ ] Upload profile picture with preview
- [ ] Upload multiple medical records
- [ ] Edit existing pet
- [ ] Verify profile picture updates
- [ ] Verify medical records persist
- [ ] Delete pet with confirmation
- [ ] File validation works (wrong file type rejected)
- [ ] UI shows loading states during upload
- [ ] Cloudinary URLs are permanent and accessible
- [ ] MongoDB contains all data correctly

## Common Issues & Solutions

**Issue**: "Pet not found" error

- **Solution**: Ensure `const { petId } = await params;` in route handlers

**Issue**: Upload fails silently

- **Solution**: Check Cloudinary credentials in .env
- **Solution**: Verify user's familyProfile exists in MongoDB

**Issue**: Medical records don't persist

- **Solution**: Ensure formData.append("description", ...) is sent for medical records
- **Solution**: Check medicalRecords array format in MongoDB

**Issue**: Profile picture not showing

- **Solution**: Verify profileImage URL is valid Cloudinary URL
- **Solution**: Check image compression settings in upload route

## File Locations

- **Component**: [src/components/PetManagement.js](src/components/PetManagement.js)
- **Upload API**: [src/app/api/pets/upload/route.js](src/app/api/pets/upload/route.js)
- **Pet Routes**: [src/app/api/pets/[petId]/route.js](src/app/api/pets/[petId]/route.js)
- **Pet Model**: [src/models/pet.js](src/models/pet.js)
