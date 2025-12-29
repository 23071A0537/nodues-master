const mongoose = require("mongoose");
const readline = require("readline");
require("dotenv").config();

const Due = require("./models/Due");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askConfirmation = () => {
  return new Promise((resolve) => {
    rl.question("Type 'DELETE' to confirm deletion: ", (answer) => {
      rl.close();
      resolve(answer === "DELETE");
    });
  });
};

const clearAllDues = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const count = await Due.countDocuments();
    console.log(`📊 Found ${count} dues in the database`);

    if (count === 0) {
      console.log("ℹ️  No dues to delete");
      process.exit(0);
    }

    console.log("\n⚠️  WARNING: This will permanently delete ALL dues!");
    const confirmed = await askConfirmation();

    if (!confirmed) {
      console.log("❌ Deletion cancelled");
      process.exit(0);
    }

    const result = await Due.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} dues`);

    const remainingCount = await Due.countDocuments();
    console.log(`📊 Remaining dues: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log("✨ All dues cleared successfully!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing dues:", error.message);
    process.exit(1);
  }
};

clearAllDues();
