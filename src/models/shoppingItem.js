import mongoose from "mongoose";

const shoppingItemSchema = new mongoose.Schema(
  {
    familyProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyProfile",
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
    itemName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["food", "treats", "supplies", "toys", "medication", "other"],
      required: true,
    },
    quantity: Number,
    unit: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },
    estimatedCost: Number,
    supplier: String,
    notes: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },
  },
  { timestamps: true },
);

const ShoppingItem =
  mongoose.models.ShoppingItem ||
  mongoose.model("ShoppingItem", shoppingItemSchema);

export default ShoppingItem;
export { shoppingItemSchema };
