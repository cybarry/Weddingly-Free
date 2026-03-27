import mongoose, { Schema, models } from "mongoose";

const giftItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    // 'none' = not yet gifted, 'item' = physical item received, 'cash' = cash equivalent received
    giftedStatus: {
      type: String,
      enum: ["none", "item", "cash"],
      default: "none",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const GiftItem =
  models.GiftItem || mongoose.model("GiftItem", giftItemSchema);
export default GiftItem;
