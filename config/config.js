const sessionSecret ="mysitesessionsecret";
const config = require("../config/config");  
const emailUser ="reshmarajendranrajendran333@gmail.com";
const emailPassword ="";
// Load environment variables first
require("dotenv").config();

// Export configuration
module.exports = {
  emailUser: process.env.EMAIL || "default_email@gmail.com",        // fallback if not set
  emailPassword: process.env.EMAIL_PASS || "default_password",      // fallback
  sessionSecret: process.env.SESSION_SECRET || "mysitesessionsecret",
  mongoURI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/umsdb"
};
