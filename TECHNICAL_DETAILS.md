# Technical Implementation Details

## Files Created

### 1. `/src/app/api/pets/upload/route.js`

A new API endpoint for handling file uploads to Cloudinary with MongoDB integration.

**Request Format:**

```
POST /api/pets/upload
Content-Type: multipart/form-data

Body:
- file: File (image for profile picture, PDF/DOC/image for medical record)
- petId: string (MongoDB ID of the pet)
- uploadType: "profilePicture" | "medicalRecord"
- description: string (optional, for medical records)
```

**Response Format:**

```javascript
// Success (Profile Picture)
{
  success: true,
  url: "https://cloudinary.com/...",
  message: "Profile picture uploaded successfully"
}

// Success (Medical Record)
{
  success: true,
  url: "https://cloudinary.com/...",
  fileName: "vaccination-2024.pdf",
  message: "Medical record uploaded successfully"
}

// Error
{
  error: "Error message"
}
```

**Key Implementation Details:**

- Uses Cloudinary v2 API with server-side upload
- Validates user authentication with Clerk
- Verifies pet ownership before processing
- Optimizes profile pictures (500x500, face-focused crop)
- Stores medical records with metadata

## Files Modified

### 1. `/src/components/PetManagement.js`

Enhanced with multi-step form and file upload functionality.

**New Imports:**

```javascript
import { Plus, Edit, Trash2, Loader, Upload, X, Check } from "lucide-react";
```

**New State Management:**

```javascript
const [currentStep, setCurrentStep] = useState(1);
const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
const [uploadingMedicalRecords, setUploadingMedicalRecords] = useState(false);
const [profilePicturePreview, setProfilePicturePreview] = useState(null);
const [medicalRecordDescription, setMedicalRecordDescription] = useState("");
const [medicalRecords, setMedicalRecords] = useState([]);
```

**New Methods:**

#### `handleProfilePictureUpload(e)`

- Validates file is an image
- Creates data URL for preview
- Uploads immediately if editing existing pet
- Updates preview state

#### `handleMedicalRecordUpload(e)`

- Validates file type (PDF, DOC, DOCX, or image)
- Queues file locally with description
- Shows in preview list before submission
- Allows multiple files

#### `removeMedicalRecord(tempId)`

- Removes queued medical record
- Updates medicalRecords state

#### `uploadFile(file, uploadType, petId)`

- Creates FormData with file and metadata
- Sends to `/api/pets/upload` endpoint
- Sets loading state during upload
- Returns upload response
- Shows user feedback on error

#### `handleSubmit(e)`

- First saves basic pet data
- Then uploads medical records (if any)
- Finally refreshes pet list
- Resets form state

#### `resetForm()`

- Clears all form state
- Resets step to 1
- Closes form modal

**Form Structure:**

- Step 1: Basic Info (name, animal, breed, age, weight, DOB)
- Step 2: Profile Picture (image upload with preview)
- Step 3: Medical Records (file upload with queuing)

**Pet Card Enhancements:**

- Displays profile picture if available
- Shows medical records count with emoji icon
- Added image placeholder styling

## Database Schema

### Pet Model (Already Configured)

```javascript
{
  profileImage: String,  // Cloudinary URL
  medicalRecords: [
    {
      fileName: String,
      fileUrl: String,   // Cloudinary URL
      uploadedAt: Date,
      description: String
    }
  ]
}
```

## Cloudinary Integration

### Setup

```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

### Upload Options

**Profile Picture:**

```javascript
{
  folder: "pet-care-app/profile-pictures",
  resource_type: "auto",
  transformation: [
    { width: 500, height: 500, crop: "fill", gravity: "face" }
  ]
}
```

**Medical Records:**

```javascript
{
  folder: "pet-care-app/medical-records",
  resource_type: "auto"
}
```

## Security Measures

1. **Authentication:** All endpoints require Clerk authentication
2. **Authorization:** Verifies pet ownership via family profile
3. **File Validation:** Server-side validation of file types
4. **Error Handling:** Safe error messages without exposing sensitive info
5. **User Data:** Only owners can access their pets' data

## Performance Optimizations

1. **Image Optimization:** Cloudinary auto-crops profile pictures
2. **Async Upload:** Non-blocking file uploads
3. **Loading States:** Prevents duplicate uploads
4. **Lazy Loading:** Pet images load on demand
5. **Medical Records Queue:** Batch uploads after pet creation

## Error Handling

**Client-side:**

- File type validation before upload
- Required field validation
- User-friendly error messages
- Loading states to prevent duplicate submissions

**Server-side:**

- Authentication checks
- Pet ownership verification
- File validation
- Cloudinary error handling
- Database transaction safety

## API Call Flow

### Creating New Pet with Files

```
1. POST /api/pets (basic info)
   ├─ Returns: { _id, ...petData }
   │
2. POST /api/pets/upload (profile picture - if provided)
   ├─ Updates: pet.profileImage
   │
3. POST /api/pets/upload (medical record 1 - if provided)
   ├─ Adds to: pet.medicalRecords[]
   │
4. POST /api/pets/upload (medical record 2 - if provided)
   ├─ Adds to: pet.medicalRecords[]
   │
5. GET /api/pets (refresh list)
   └─ Displays updated pet cards
```

## Browser Compatibility

- Supports modern browsers with FormData API
- File preview uses HTML5 FileReader API
- CSS Grid/Flexbox for responsive layout
- Supports drag-and-drop areas (visual styling ready)

## Testing Checklist

- [ ] Create pet with basic info only
- [ ] Create pet with profile picture
- [ ] Create pet with medical records
- [ ] Create pet with all fields filled
- [ ] Upload multiple medical records
- [ ] Edit existing pet
- [ ] Change profile picture on existing pet
- [ ] Add more medical records to existing pet
- [ ] Verify Cloudinary URLs are secure_url (HTTPS)
- [ ] Check MongoDB documents contain correct URLs
- [ ] Test with different file types (PDF, DOC, images)
- [ ] Verify proper error handling with invalid files
- [ ] Test on mobile devices (responsive)
- [ ] Verify loading states show correctly

## Environment Variables Required

```
CLOUDINARY_CLOUD_NAME=your_value
CLOUDINARY_API_KEY=your_value
CLOUDINARY_API_SECRET=your_value
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
```

## Dependencies

- `cloudinary` - Server-side file uploads
- `next` - Framework
- `lucide-react` - Icons (Upload, X, Check, Loader, etc.)
- `@clerk/nextjs` - Authentication

All dependencies should already be in your project.
