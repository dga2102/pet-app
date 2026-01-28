import mongoose from "mongoose";

const dailyTaskSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HouseholdMember",
    },
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
    description: String,
    taskType: {
      type: String,
      enum: ["feeding", "walking", "medication", "grooming", "play", "other"],
      required: true,
    },
    time: String, // HH:mm format
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
      required: true,
    },
    daysOfWeek: [
      {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6], // 0 = Sunday, 6 = Saturday
      },
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const DailyTask =
  mongoose.models.DailyTask || mongoose.model("DailyTask", dailyTaskSchema);

export default DailyTask;
export { dailyTaskSchema };
