import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    familyProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyProfile",
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["vet", "groomer", "walker", "training", "other"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    provider: {
      name: String,
      phone: String,
      email: String,
      address: String,
    },
    notes: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: true,
      },
      minutesBefore: {
        type: Number,
        default: 1440, // 24 hours
      },
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    cost: Number,
    recurringPattern: {
      type: String,
      enum: ["once", "daily", "weekly", "monthly", "yearly"],
      default: "once",
    },
  },
  { timestamps: true },
);

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

export default Appointment;
export { appointmentSchema };
