const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      set: (v) => (v === '' || v === 'null' ? null : v),
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember',
      set: (v) => (v === '' || v === 'null' ? null : v),
    },
    status: {
      type: String,
      enum: [
        'To Do',
        'In Development',
        'Testing / QA',
        'Client Review',
        'Completed',
      ],
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    dueDate: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
