// models/Item.js
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["in_stock", "out_of_stock"],
      default: "in_stock",
    },
    godown_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Godown",
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    attributes: {
      type: Object,
    },
    image_url: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ItemSchema.index({ godown_id: 1 });

const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;
