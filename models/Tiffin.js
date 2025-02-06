const mongoose = require("mongoose");

const tiffinSchema = new mongoose.Schema({
  date: { type: String, required: true },
  tiffers: { type: [String], required: true },
  type: { type: String, enum: ["Lunch", "Dinner"], required: true },
  numberOfTiffins: Number,
  costOfTiffin: Number,
  extrasType: String,
  countOfExtras: Number,
  costOfExtra: Number,
  extraTiffers: { type: [String], default: [] },
  description: String,
  deliveryCharge: { type: Number, default: 30 },
});

module.exports = mongoose.model("Tiffin", tiffinSchema);
