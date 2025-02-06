const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const Tiffin = require("./models/Tiffin");

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files (optional)
app.use(express.static("public"));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Routes

// Add new Tiffin entry
app.post("/api/tiffins", async (req, res) => {
  try {
    const tiffinData = req.body;
    const newTiffin = new Tiffin(tiffinData);
    await newTiffin.save();
    res.status(201).json(newTiffin);
  } catch (error) {
    res.status(500).json({ error: "Failed to add tiffin record" });
  }
});

// Get all Tiffin entries
app.get("/api/tiffins", async (req, res) => {
  try {
    const tiffins = await Tiffin.find().sort({ date: -1 });
    res.json(tiffins);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// app.delete("/api/tiffins/all", async (req, res) => {
//   try {
//     const result = await Tiffin.deleteMany({}); // Deletes all entries
//     res.json({
//       message: "All tiffin entries deleted successfully",
//       deletedCount: result.deletedCount,
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to delete all tiffin entries" });
//   }
// });

// Delete entry by _id
app.delete("/api/tiffins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Tiffin.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
      res.status(200).send("Entry deleted successfully.");
    } else {
      res.status(404).send("Entry not found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
});

// app.put("/api/tiffins/:id", async (req, res) => {
//   try {
//     const updatedTiffin = await Tiffin.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedTiffin) {
//       return res.status(404).json({ error: "Tiffin entry not found" });
//     }
//     res.json(updatedTiffin);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update tiffin entry" });
//   }
// });






// Server Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on Port: ${PORT}`);
});
