import mongoose from "mongoose";

const caretakerSchema = new mongoose.Schema(
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
    email: {
      type: String,
      required: true,
    },
    phone: String,
    role: {
      type: String,
      enum: ["primary", "secondary", "helper"],
      default: "secondary",
    },
    clerkId: String,
    profileImage: String,
  },
  { timestamps: true },
);

const Caretaker =
  mongoose.models.Caretaker || mongoose.model("Caretaker", caretakerSchema);

export default Caretaker;
export { caretakerSchema };
