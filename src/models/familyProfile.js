import mongoose from "mongoose";

const familyProfileSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    familyName: {
      type: String,
      required: true,
    },
    primaryContact: {
      name: String,
      email: String,
      phone: String,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Caretaker",
      },
    ],
    pets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
      },
    ],
  },
  { timestamps: true },
);

const FamilyProfile =
  mongoose.models.FamilyProfile ||
  mongoose.model("FamilyProfile", familyProfileSchema);

export default FamilyProfile;
export { familyProfileSchema };
