import mongoose from "mongoose";

const householdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: function () {
      return `Household`;
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Household ||
  mongoose.model("Household", householdSchema);
