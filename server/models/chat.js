import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const jobSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Other'],
  },
  location:{
    type: 'string',
  },
  postedDate:{
    type: Date,
  },
  compnyName:{
    type: String,
    require: true
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const resumeScanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  context: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  highlights: [{
    type: String
  }],
  improvements: [{
    type: String
  }],
  chat: [messageSchema],
  jobs: [jobSchema],
  role: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

const ResumeScan = mongoose.model('ResumeScan', resumeScanSchema);

export default ResumeScan;