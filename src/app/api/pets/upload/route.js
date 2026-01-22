import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/db";
import Pet from "@/models/pet";
import FamilyProfile from "@/models/familyProfile";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");
    const petId = formData.get("petId");
    const uploadType = formData.get("uploadType");
    const description = formData.get("description") || "";

    if (!file || !petId || !uploadType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify pet ownership
    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const pet = await Pet.findOne({
      _id: petId,
      familyProfileId: familyProfile._id,
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary based on type
    let uploadOptions = {
      folder: "pet-care-app",
      resource_type: "auto",
    };

    if (uploadType === "profilePicture") {
      uploadOptions = {
        ...uploadOptions,
        folder: "pet-care-app/profile-pictures",
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "face" },
        ],
      };
    } else if (uploadType === "medicalRecord") {
      // All medical records are treated as raw files (PDF/DOC)
      uploadOptions = {
        ...uploadOptions,
        folder: "pet-care-app/medical-records",
        resource_type: "raw",
      };
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(buffer);
    });

    // Update pet in database based on upload type
    if (uploadType === "profilePicture") {
      pet.profileImage = result.secure_url;
      await pet.save();
      return NextResponse.json(
        {
          success: true,
          url: result.secure_url,
          message: "Profile picture uploaded successfully",
        },
        { status: 200 },
      );
    } else if (uploadType === "medicalRecord") {
      // For raw files (PDF/DOC), construct public URL from public_id
      const fileUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${result.public_id}`;

      pet.medicalRecords.push({
        fileName: file.name,
        fileUrl: fileUrl,
        uploadedAt: new Date(),
        description: description,
      });
      await pet.save();
      return NextResponse.json(
        {
          success: true,
          url: fileUrl,
          fileName: file.name,
          message: "Medical record uploaded successfully",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
