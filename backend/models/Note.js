import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
