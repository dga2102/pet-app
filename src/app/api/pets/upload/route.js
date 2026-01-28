import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Pet from "@/models/pet";
import { sessionOptions } from "@/lib/session";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const petId = formData.get("petId");
    const uploadType = formData.get("uploadType");
    const description = formData.get("description");

    if (!file || !petId || !uploadType) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify pet belongs to user's household
    const pet = await Pet.findById(petId);

    if (!pet) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }

    if (pet.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `pets/${petId}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      uploadStream.end(buffer);
    });

    // Update pet based on upload type
    if (uploadType === "profilePicture") {
      pet.profileImage = uploadResult.secure_url;
      await pet.save();

      return Response.json({
        success: true,
        url: uploadResult.secure_url,
        type: "profilePicture",
      });
    }

    if (uploadType === "medicalRecord") {
      pet.medicalRecords.push({
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        description: description || "",
        uploadedAt: new Date(),
      });
      await pet.save();

      return Response.json({
        success: true,
        url: uploadResult.secure_url,
        type: "medicalRecord",
      });
    }

    return Response.json({ error: "Invalid upload type" }, { status: 400 });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
