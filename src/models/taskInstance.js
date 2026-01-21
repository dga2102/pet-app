import mongoose from "mongoose";

const taskInstanceSchema = new mongoose.Schema(
  {
    dailyTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyTask",
      required: true,
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
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    title: String,
    taskType: String,
    time: String,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },
    notes: String,
  },
  { timestamps: true },
);

const TaskInstance =
  mongoose.models.TaskInstance ||
  mongoose.model("TaskInstance", taskInstanceSchema);

export default TaskInstance;
export { taskInstanceSchema };
