import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    familyProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyProfile",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    animal: {
      type: String,
      enum: ["dog", "cat", "bird", "rabbit", "hamster", "guinea pig", "other"],
      required: true,
    },
    breed: String,
    age: Number,
    weight: Number,
    microchipId: String,
    dateOfBirth: Date,
    profileImage: String,
    medicalRecords: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        description: String,
      },
    ],
    medicalHistory: [
      {
        condition: String,
        date: Date,
        notes: String,
      },
    ],
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    vaccinations: [
      {
        name: String,
        date: Date,
        expiryDate: Date,
        veterinarian: String,
      },
    ],
  },
  { timestamps: true },
);

const Pet = mongoose.models.Pet || mongoose.model("Pet", petSchema);

export default Pet;
export { petSchema };
