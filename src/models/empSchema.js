import mongoose from "mongoose";

const empSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String },
  specialization: { type: String },
  empId: { type: String, unique: true },
  joinDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Emp", empSchema);