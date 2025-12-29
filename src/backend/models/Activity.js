const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  actionType: { type: String, required: true },  // e.g. 'add_due', 'delete_due', 'enable_delete', 'add_user'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userType: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  target: { type: mongoose.Schema.Types.ObjectId }  // Can point to Student or Faculty or other entities
});

activitySchema.index({ timestamp: -1 }); // Recent activities first

module.exports = mongoose.model('Activity', activitySchema);
