import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    taskType: {
      type: String,
      enum: [
        "feeding",
        "walking",
        "medication",
        "grooming",
        "play",
        "training",
        "other",
      ],
      required: true,
    },
    time: {
      type: String, // Format: "HH:MM"
      required: true,
    },
    daysOfWeek: {
      type: [Number], // 0-6 (Sunday-Saturday)
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Model for tracking daily task completions
const taskCompletionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Compound index to prevent duplicate completions
taskCompletionSchema.index({ taskId: 1, date: 1 }, { unique: true });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
const TaskCompletion =
  mongoose.models.TaskCompletion ||
  mongoose.model("TaskCompletion", taskCompletionSchema);

export default Task;
export { TaskCompletion };
