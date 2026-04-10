const mongoose = require('mongoose');

const panelSchema = new mongoose.Schema({
  // Panel Metadata
  panelNumber: {
    type: Number,
    required: true,
    min: 1
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
    index: true
  },
  academicYear: {
    type: String,
    required: true,
    index: true
  },

  // Panel Members
  members: [{
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true
    },
    department: {
      type: String,
      enum: ['CSE', 'ECE', 'ASH'],
      required: true
    },
    role: {
      type: String,
      enum: ['conveyer', 'member'],
      required: true,
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Panel Constraints
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for finding panels by semester and academic year
panelSchema.index({ semester: 1, academicYear: 1, isActive: 1 });

// Method to get panel details with faculty info
panelSchema.methods.getDetailedInfo = async function() {
  return await this.populate('members.faculty', 'fullName email department facultyId');
};

// Method to find conveyer
panelSchema.methods.getConveyer = function() {
  return this.members.find(m => m.role === 'conveyer');
};

// Method to get non-conveyer members
panelSchema.methods.getMembers = function() {
  return this.members.filter(m => m.role === 'member');
};

module.exports = mongoose.model('Panel', panelSchema);
