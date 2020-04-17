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
let m_sockets = [];

function log(...args) {
  console.log(path.basename(__filename) + ': ');
  console.dir(args, {depth: null});
}

// io.emit() for messages to all connections
// socket.broadcast.emit() for messages to connections other than socket
// socket.emit() for messages to socket only

function sendToAllUsers(message) {
  io.emit(messages.RESPONSE_MESSAGE, message);
}

function sendToUser(username, message) {
  // find socket in our list with matching username
  const idx = m_sockets.findIndex((e) => e.username === username)
  if (idx >= 0) {
    m_sockets[idx].socket.emit(messages.RESPONSE_MESSAGE, message);
  }
}

app.use(express.static('static'));

const dungeon = new Dungeon(sendToAllUsers, sendToUser);

io.on('connection', (socket) => {
  // handle incoming connection
  //const socketId = socket.id;
  log(`user connected on socket ${socket.id}`);

  // add this socket to our list
  m_sockets.push({
    socket: socket,
    username: ''
  });

  // start receiving commands from client
  socket.on(messages.COMMAND_MESSAGE, (username, password, cmd) => {
    log(`socket ${socket.id}, user ${username}: COMMAND_MESSAGE received: ${cmd}`);

    // find this socket in our list; set its username
    const idx = m_sockets.findIndex((e) => e.socket.id === socket.id)
    m_sockets[idx].username = username;

    const result = dungeon.playerCommand(username, cmd);
    log('result: ', result);
    sendToUser(username, result);
  });

  // handle client disconnect
  socket.on('disconnect', () => {
    log(`user disconnected on ${socket.id}`);
    // remove this socket from our list
    m_sockets = m_sockets.filter((e) => e.socket.id !== socket.id)
  });
});


http.listen(PORT, () => {
  log(`listening on port ${PORT}`);
});


