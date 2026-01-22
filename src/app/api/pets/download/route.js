import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Pet from "@/models/pet";
import FamilyProfile from "@/models/familyProfile";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    const fileName = searchParams.get("name");
    const petId = searchParams.get("petId");

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: "Missing url or name parameter" },
        { status: 400 },
      );
    }

    // Verify pet ownership if petId is provided
    if (petId) {
      await connectDB();
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
    }

    // Fetch the file from Cloudinary
    const response = await fetch(fileUrl);

    if (!response.ok) {
      console.error(
        `Cloudinary fetch failed: ${response.status} ${response.statusText}`,
      );
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.statusText}` },
        { status: response.status },
      );
    }

    // Get the file buffer
    const buffer = await response.arrayBuffer();

    // Determine content type based on file extension
    const extension = fileName.split(".").pop().toLowerCase();
    const contentTypeMap = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      txt: "text/plain",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
    };

    const contentType = contentTypeMap[extension] || "application/octet-stream";

    // Return with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
