const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // Primary role (for backwards compatibility)
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'department_operator', 'hod', 'faculty'],
    required: true
  },
  // Multiple roles support (composite roles)
  roles: [{
    type: String,
    enum: ['super_admin', 'admin', 'department_operator', 'hod', 'faculty']
  }],
  // Department for operator role (required if has department_operator role)
  department: { 
    type: String,
    required: function() {
      return this.roles?.includes('department_operator') || this.role === 'department_operator';
    }
  },
  // Department for HOD role (may be different from operator department)
  hodDepartment: {
    type: String
  },
  // Faculty reference if user is also a faculty member
  facultyRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  // Track if this user was created from faculty import
  isFromFaculty: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Virtual to get display roles
userSchema.virtual('displayRoles').get(function() {
  if (this.roles && this.roles.length > 0) {
    return this.roles.join(' & ');
  }
  return this.role;
});

// Method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  if (this.roles && this.roles.length > 0) {
    return this.roles.includes(role);
  }
  return this.role === role;
};

// Method to add a role
userSchema.methods.addRole = function(newRole) {
  if (!this.roles) {
    this.roles = [this.role];
  }
  if (!this.roles.includes(newRole)) {
    this.roles.push(newRole);
  }
};

// Method to remove a role
userSchema.methods.removeRole = function(roleToRemove) {
  if (this.roles && this.roles.length > 1) {
    this.roles = this.roles.filter(r => r !== roleToRemove);
    // Update primary role
    this.role = this.roles[0];
  }
};

module.exports = mongoose.model('User', userSchema);
