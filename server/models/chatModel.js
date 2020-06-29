const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  text: { type: String, required: true },
  senderId: { type: mongoose.Types.ObjectId, ref: 'User' },
  recipientId: { type: mongoose.Types.ObjectId, ref: 'User' },
});

mongoose.model('Chat', ChatSchema);
