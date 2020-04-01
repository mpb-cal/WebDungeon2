/* eslint-disable no-console */

const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Dungeon = require('./dungeon');
const common = require('./common');
const messages = require('./static/messages');

const PORT = 5500;
let sockets = {};

function log(...args) {
  console.log(path.basename(__filename) + ': ');
  console.dir(args, {depth: null});
}

// io.emit() for messages to all connections
// socket.broadcast.emit() for messages to connections other than socket
// socket.emit() for messages to socket only

function sendToAllUsers(message) {
  //log(`sendToAllUsers: ${message}`);
  io.emit(messages.RESPONSE_MESSAGE, message);
}

function sendToUser(socketId, message) {
  const socket = sockets[socketId];
  if (socket) {
    //log('sendToUser: ', message);
    socket.emit(messages.RESPONSE_MESSAGE, message);
  }
}

app.use(express.static('static'));
const dungeon = new Dungeon;
dungeon.adminCommand(common.CMD_RESET_GAME); // mpb! misspelled not caught
dungeon.on(Dungeon.SEND_TO_ALL_USERS, sendToAllUsers);
dungeon.on(Dungeon.SEND_TO_USER, sendToUser);

io.on('connection', (socket) => {
  // handle incoming connection
  const socketId = socket.id;
  sockets[socketId] = socket;
  const result = dungeon.adminCommand(common.CMD_CREATE_USER, socketId);
  log(`user connected on socket ${socketId}`);

  // handle client disconnect
  socket.on('disconnect', () => {
    log(`user disconnected on ${socketId}`);
    const result = dungeon.adminCommand(common.CMD_DROP_USER, socketId);
  });

  // start receiving commands from client
  socket.on(messages.COMMAND_MESSAGE, (username, password, cmd) => {
    log(`socket ${socketId}, user ${username}: COMMAND_MESSAGE received: ${cmd}`);
    const result = dungeon.playerCommand(socketId, cmd);
    sendToUser(socketId, result);
  });
});


http.listen(PORT, () => {
  log(`listening on port ${PORT}`);
});


