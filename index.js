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

app.use(express.static('static'));

function log(...args) {
  console.log(path.basename(__filename) + ': ');
  console.dir(args, {depth: null});
}

const dungeon = new Dungeon;
dungeon.adminCommand(common.CMD_RESET_GAME); // mpb! misspelled not caught
dungeon.on(Dungeon.SEND_TO_ALL_USERS, sendToAllUsers);
dungeon.on(Dungeon.SEND_TO_USER, sendToUser);

io.on('connection', function(socket) {
  // io.emit() for messages to all connections
  // socket.broadcast.emit() for messages to connections other than this one
  // socket.emit() for messages to this connection only

  const username = socket.id;
  sockets[username] = socket;
  const result = dungeon.adminCommand(common.CMD_CREATE_USER, username);
  log(`user ${username}: result:`);
  log(result);

  log(`user ${username}: connected`);

  socket.on('disconnect', function() {
    log(`user ${username}: disconnected`);
    const result = dungeon.adminCommand(common.CMD_DROP_USER, username);
  });

  socket.on(messages.COMMAND_MESSAGE, function(msg) {
    log(`user ${username}: ${messages.COMMAND_MESSAGE} received: ${msg}`);
    const result = dungeon.playerCommand(username, msg);
    sendToUser(username, result);
  });
});


http.listen(PORT, function() {
  log(`listening on port ${PORT}`);
});


function sendToAllUsers(message) {
  log(`sendToAllUsers: ${message}`);
  io.emit(messages.RESPONSE_MESSAGE, message);
}


function sendToUser(username, message) {
  const socket = sockets[username];
  if (socket) {
    log('sendToUser: ', message);
    socket.emit(messages.RESPONSE_MESSAGE, message);
  }
}


