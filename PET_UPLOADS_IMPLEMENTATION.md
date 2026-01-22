# Pet Management File Upload Implementation

## Overview

Added two new upload features to the Pet Management form with server-side processing and MongoDB integration:

1. **Profile Picture Upload** - Image files (PNG, JPG, GIF, etc.)
2. **Medical Records Upload** - PDF, DOC, DOCX, and image files

## Architecture

### Files Modified/Created

#### 1. **API Route: `/src/app/api/pets/upload/route.js`** (NEW)

Server-side upload handler that:

- Validates user authentication via Clerk
- Handles both profile picture and medical record uploads
- Uploads files to Cloudinary with automatic optimization
- Updates MongoDB Pet document with file URLs and metadata
- Returns structured responses with URLs and file information

**Key Features:**

- Supports FormData for multipart file uploads
- Profile pictures are automatically optimized (500x500, face-focused crop)
- Medical records preserved in original quality with metadata
- Separate folder organization in Cloudinary

#### 2. **Component: `/src/components/PetManagement.js`** (UPDATED)

Enhanced with multi-step form wizard:

- **Step 1**: Basic pet information (name, animal type, breed, age, weight, DOB)
- **Step 2**: Profile picture upload with preview
- **Step 3**: Medical records upload with descriptions

**New Features:**

- Multi-step form with progress indicator
- File preview before submission
- Medical records queue system (add multiple before submitting)
- Upload status indicators with loading states
- Pet cards now display profile pictures and medical records count

**New State Variables:**

```javascript
const [currentStep, setCurrentStep] = useState(1);
const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
const [uploadingMedicalRecords, setUploadingMedicalRecords] = useState(false);
const [profilePicturePreview, setProfilePicturePreview] = useState(null);
const [medicalRecordDescription, setMedicalRecordDescription] = useState("");
const [medicalRecords, setMedicalRecords] = useState([]);
```

**New Functions:**

- `handleProfilePictureUpload()` - Handles image file selection and preview
- `handleMedicalRecordUpload()` - Queues medical records for upload
- `removeMedicalRecord()` - Removes records from queue
- `uploadFile()` - Uploads files to Cloudinary via API
- `resetForm()` - Clears all form state after submission

#### 3. **Database Model: `/src/models/pet.js`** (NO CHANGES NEEDED)

Already includes required fields:

- `profileImage`: String (URL to Cloudinary)
- `medicalRecords`: Array of objects with:
  - `fileName`: String
  - `fileUrl`: String (URL to Cloudinary)
  - `uploadedAt`: Date (auto-set)
  - `description`: String (optional)

## How It Works

### Adding a New Pet

1. Click "Add Pet" button
2. **Step 1**: Fill in basic pet information
3. **Step 2**: Upload profile picture (optional)
   - Select image file
   - Preview displays in 500x500 container
   - Automatically uploaded to Cloudinary when image selected
4. **Step 3**: Upload medical records (optional)
   - Select files to queue multiple records
   - Add descriptions for each record
   - Files uploaded after pet creation
5. Click "Create Pet" to save

### Updating a Pet

- Edit button loads existing pet data
- Profile picture shows existing image
- Steps 2 & 3 allow updating images and medical records
- New uploads replace old data (for profile picture) or add to collection (for medical records)

### File Upload Flow

```
User selects file
    ↓
Client-side validation (file type, size)
    ↓
Preview display (for images)
    ↓
Form submission triggers API call
    ↓
Server-side validation
    ↓
Upload to Cloudinary
    ↓
Cloudinary returns secure_url
    ↓
MongoDB updated with URL and metadata
    ↓
Pet card displays image/records count
```

## Environment Setup

Ensure your `.env` file contains Cloudinary credentials:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

The implementation uses the `cloudinary` npm package for server-side uploads.

## File Type Support

### Profile Picture

- PNG, JPG, JPEG, GIF, WebP
- Optimized to 500x500 with face-focused crop

### Medical Records

- PDF (application/pdf)
- Word Documents (.doc, .docx)
- Images (PNG, JPG, JPEG, GIF)

## Database Updates

### When Creating a New Pet

```javascript
// Basic pet data saved
POST /api/pets

// Then medical records uploaded individually
POST /api/pets/upload (for each medical record)

// Finally profile picture uploaded
POST /api/pets/upload
```

### When Updating a Pet

```javascript
// Pet data updated
PUT / api / pets / { petId };

// New files uploaded and added to pet document
POST / api / pets / upload;
```

## UI Components

### Step Indicator

- Visual progress bar showing current step (1/2/3)
- Completed steps show checkmark icon
- Labels show step names

### File Upload Areas

- Drag-and-drop style with icon and instructions
- File type requirements displayed
- Loading spinner during upload
- Disabled during upload to prevent multiple submissions

### Pet Cards

- Profile picture displays at top (if available)
- Shows name, animal type, breed, age, weight, DOB
- Displays count of medical records
- Edit and delete buttons

## Error Handling

The implementation includes:

- File type validation on client and server
- User authentication checks via Clerk
- Pet ownership verification
- Cloudinary error handling
- User-friendly error messages via alerts

## Performance Considerations

- Profile pictures optimized automatically by Cloudinary
- Medical records preserved in original quality
- Files organized in separate Cloudinary folders
- Async upload handling prevents UI blocking
- Loading states provide user feedback

## Future Enhancements

Potential additions:

- View/download individual medical records
- Batch delete medical records
- Medical record categories/tags
- File preview before upload
- Storage quota management
- Medical record search/filter
