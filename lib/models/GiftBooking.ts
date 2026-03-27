import mongoose, { Schema, models } from "mongoose";

const giftBookingSchema = new Schema(
  {
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    itemPrice: { type: Number, required: true },
    itemCurrency: { type: String, default: "USD" },
    giftType: {
      type: String,
      enum: ["item", "cash"],
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

export const GiftBooking =
  models.GiftBooking || mongoose.model("GiftBooking", giftBookingSchema);
export default GiftBooking;
