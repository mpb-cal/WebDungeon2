/* eslint-disable no-console */

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Dungeon = require('./dungeon');
const common = require('./common');
const messages = require('./static/messages');

const PORT = 5500;
let sockets = {};

app.use(express.static('static'));

const dungeon = new Dungeon;
dungeon.adminCommand(common.CMD_RESET_GAME); // mpb! misspelled not caught
dungeon.on(dungeon.SEND_TO_ALL_USERS, sendToAllUsers);
dungeon.on(dungeon.SEND_TO_USER, sendToUser);

io.on('connection', function(socket) {
  // io.emit() for messages to all connections
  // socket.broadcast.emit() for messages to connections other than this one
  // socket.emit() for messages to this connection only

  const username = socket.id;
  sockets[username] = socket;
  const result = dungeon.adminCommand(common.CMD_CREATE_USER, username);
  console.log(`user ${username}: result:`);
  console.log(result);

  console.log(`user ${username}: connected`);

  socket.on('disconnect', function() {
    console.log(`user ${username}: disconnected`);
    const result = dungeon.adminCommand(common.CMD_DROP_USER, username);
  });

  socket.on(messages.COMMAND_MESSAGE, function(msg) {
    console.log(`user ${username}: ${messages.COMMAND_MESSAGE} received: ${msg}`);
    const result = dungeon.playerCommand(username, msg);
    console.log(`user ${username}: result:`);
    console.log(result);
    sendToUser(username, result);
  });
});


http.listen(PORT, function() {
  console.log(`listening on port ${PORT}`);
});


function sendToAllUsers(message) {
  console.log(`sendToAllUsers: ${message}`);
  io.emit(messages.RESPONSE_MESSAGE, message);
}


function sendToUser(username, message) {
  const socket = sockets[username];
  if (socket) {
    console.log(`sendToUser: ${message}`);
    socket.emit(messages.RESPONSE_MESSAGE, message);
  }
}


