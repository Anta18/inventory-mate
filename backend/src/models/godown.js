// models/Godown.js
const mongoose = require("mongoose");
const User = require("./user");

const GodownSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parent_godown: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Godown",
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

GodownSchema.index({ owner: 1 });

// Virtual for Godown's Items
GodownSchema.virtual("items", {
  ref: "Item",
  localField: "_id",
  foreignField: "godown_id",
});

// Virtual for Child Godowns (Sub-Godowns)
GodownSchema.virtual("subGodowns", {
  ref: "Godown",
  localField: "_id",
  foreignField: "parent_godown",
});

// Cascade delete items and sub-godowns when a godown is removed
GodownSchema.pre("remove", async function (next) {
  const godown = this;
  await Item.deleteMany({ godown_id: godown._id });
  await Godown.deleteMany({ parent_godown: godown._id });
  next();
});

const Godown = mongoose.model("Godown", GodownSchema);
module.exports = Godown;
