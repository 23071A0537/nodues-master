const mongoose = require("mongoose");
require("dotenv").config();

const Due = require("./models/Due");

/**
 * Utility script to clear all dues from the database
 * Usage: node clearDues.js
 * 
 * WARNING: This will permanently delete all dues data!
 */

const clearAllDues = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Count existing dues before deletion
    const count = await Due.countDocuments();
    console.log(`📊 Found ${count} dues in the database`);

    if (count === 0) {
      console.log("ℹ️  No dues to delete");
      process.exit(0);
    }

    // Ask for confirmation (optional safety check)
    console.log("\n⚠️  WARNING: This will permanently delete ALL dues!");
    console.log("⚠️  Press Ctrl+C to cancel or wait 3 seconds to proceed...\n");

    // Wait 3 seconds before deletion
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete all dues
    const result = await Due.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} dues`);

    // Verify deletion
    const remainingCount = await Due.countDocuments();
    console.log(`📊 Remaining dues: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log("✨ All dues cleared successfully!");
    } else {
      console.log("⚠️  Warning: Some dues may still remain");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing dues:", error.message);
    process.exit(1);
  }
};

// Run the script
clearAllDues();
