import mongoose from "mongoose";

const pendingInviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function () {
      // Invites expire in 7 days
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient token lookup
pendingInviteSchema.index({ token: 1 });
// Index to clean up expired invites
pendingInviteSchema.index({ expiresAt: 1 });

export default mongoose.models.PendingInvite ||
  mongoose.model("PendingInvite", pendingInviteSchema);
