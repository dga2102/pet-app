import mongoose from "mongoose";

const householdMemberSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["owner", "member"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure a user can only be in a household once
householdMemberSchema.index({ householdId: 1, userId: 1 }, { unique: true });

export default mongoose.models.HouseholdMember ||
  mongoose.model("HouseholdMember", householdMemberSchema);
