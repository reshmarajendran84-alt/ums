const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  is_admin: {
    type: Number,
    default: 1 // ✅ 1 = admin
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  token: { type: String, default: "" }
});

// ✅ Fix name (removed extra space)
const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
module.exports = Admin;
