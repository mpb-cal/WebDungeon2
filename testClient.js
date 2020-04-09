const io = require('socket.io-client');
const socket = io('http://localhost:5500');
const messages = require('./static/messages');
const common = require('./common');

const USERNAME = 'test';
const PASSWORD = '123';

function sendCommand(cmd) {
  socket.emit(messages.COMMAND_MESSAGE, USERNAME, PASSWORD, cmd);
}

sendCommand('\\' + common.CMD_LOOK);
sendCommand('hello from test');
sendCommand('\\' + common.CMD_NORTH);
sendCommand('\\' + common.CMD_SOUTH);


socket.on(messages.RESPONSE_MESSAGE, function(msg) {
  console.log("socket message: ", msg);
});


