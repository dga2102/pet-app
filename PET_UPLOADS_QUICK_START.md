# Quick Start Guide - Pet File Uploads

## Feature Summary

Your pet management form now includes:

- ✅ **Profile Picture Upload** - Add a photo of your pet
- ✅ **Medical Records Upload** - Store vaccination records, lab results, prescriptions, etc.
- ✅ **Multi-step Form** - Organized workflow with 3 steps

## Step-by-Step Usage

### Adding a New Pet

#### Step 1: Basic Information

1. Click the **"Add Pet"** button
2. Fill in required fields:
   - Pet Name \*
   - Animal Type \*
3. Fill in optional fields:
   - Breed
   - Age (in years)
   - Weight (in lbs)
   - Date of Birth
4. Click **"Next"** to proceed to Step 2

#### Step 2: Profile Picture

1. Click in the upload area to select an image
2. Choose any image file (PNG, JPG, GIF, etc.)
3. Preview will display immediately
4. To remove and try again, click the ✕ button on the preview
5. Click **"Next"** to proceed to Step 3

#### Step 3: Medical Records

1. (Optional) Enter a description for the record:
   - Examples: "Vaccination Records", "Lab Results", "Surgery Report"
2. Click in the upload area to select a file
3. Supported formats:
   - 📄 PDF files
   - 📝 Word documents (.doc, .docx)
   - 🖼️ Images (PNG, JPG, GIF)
4. Multiple records? Enter description → Upload file → Repeat
5. Uploaded records appear in the preview list below
6. Remove any record with the ✕ button if needed
7. Click **"Create Pet"** to save everything

### Editing a Pet

1. Click the ✏️ **Edit** button on any pet card
2. Form opens with existing data pre-filled
3. Follow the same 3 steps to update information
4. Update Step 2 to change profile picture
5. Add more medical records in Step 3
6. Click **"Update Pet"** to save changes

### Viewing Pet Information

**On the Pet Card:**

- Profile picture displays at the top (if uploaded)
- Pet details: name, animal type, breed, age, weight, DOB
- 📋 Shows count of medical records stored
- Edit (✏️) and Delete (🗑️) buttons available

**To Access Medical Records:**

- Currently stored on the pet document in MongoDB
- Future feature: Add view/download functionality

## File Requirements

### Profile Picture

- **Formats:** PNG, JPG, JPEG, GIF, WebP
- **Size:** Any size (optimized to 500x500)
- **Optional:** You can skip this step

### Medical Records

- **Formats:** PDF, DOC, DOCX, PNG, JPG, JPEG, GIF
- **Size:** Any size
- **Optional:** You can skip this step
- **Multiple Files:** Add as many records as needed

## Tips & Tricks

✨ **Profile Picture Tips:**

- Use a clear, well-lit photo of your pet's face
- Square images work best (will be cropped to 500x500)
- For profile-style photo, make sure face is centered

📋 **Medical Records Tips:**

- Add descriptions to easily identify records later
- Upload vaccination certificates, prescriptions, lab results, etc.
- PDF format recommended for documents
- Image format good for receipts or notes

🔒 **Security & Privacy:**

- All files uploaded to Cloudinary (your credentials are secure)
- Data stored in MongoDB, accessible only to authenticated users
- Each family can only see their own pets

## Troubleshooting

| Issue                                           | Solution                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| "Please upload an image file"                   | Make sure you're uploading actual image files (PNG, JPG, GIF)         |
| "Please upload a PDF, DOC, DOCX, or image file" | Medical records only support PDF, Word docs, or images                |
| Upload seems stuck                              | Check your internet connection and wait for upload to complete        |
| Can't see changes                               | Refresh the page after submission                                     |
| Missing Cloudinary setup                        | Check `.env` file has CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, etc. |

## Architecture Notes

- **Client:** React form with multi-step wizard
- **Server:** Next.js API route `/api/pets/upload`
- **Storage:** Cloudinary (cloud-based image/file hosting)
- **Database:** MongoDB (pet data + file URLs)
- **Auth:** Clerk (user authentication & ownership verification)

## Next Steps

After implementing this feature, you might want to add:

1. View individual medical records with modal/viewer
2. Edit medical record descriptions
3. Delete specific medical records
4. Medical record categories (Vaccination, Surgery, Lab, etc.)
5. Export medical records
6. Medical record timeline/history
