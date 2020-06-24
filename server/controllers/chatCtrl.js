const mongoose = require('mongoose');
const chatModel = require('../models/chatModel');
const Chat = mongoose.model('Chat');
const { chatHistoryLimit } = require('../../config/serverConfig');
const allConnectedUsers = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    const socketId = socket.id;

    socket.on('users:connect', async (data) => {
      const user = { ...data, socketId, activeRoom: null };
      allConnectedUsers[socketId] = user;
      socket.emit('users:list', Object.values(allConnectedUsers));
      socket.broadcast.emit('users:add', user);
    });

    socket.on('message:add', async (data) => {
      const { senderId, recipientId, text, roomId } = data;
      socket.emit('message:add', data);
      socket.broadcast.to(roomId).emit('message:add', data);
      try {
        const newMessage = await Chat.create({ text, senderId, recipientId });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('message:history', async (data) => {
      try {
        const { recipientId, userId } = data;
        const allMessages = await Chat.find({
          $or: [
            { senderId: userId, recipientId },
            { senderId: recipientId, recipientId: userId },
          ],
        }).limit(chatHistoryLimit);
        if (allMessages) {
          socket.emit('message:history', allMessages);
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('disconnect', () => {
      delete allConnectedUsers[socketId];
      socket.broadcast.emit('users:leave', socketId);
    });
  });
};
