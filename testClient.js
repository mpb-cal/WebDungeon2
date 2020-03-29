const io = require('socket.io-client');
const socket = io('http://localhost:5500');
const messages = require('./static/messages');
const common = require('./common');

socket.emit(messages.COMMAND_MESSAGE, common.CMD_LOOK);
socket.emit(messages.COMMAND_MESSAGE, common.CMD_CHAT + ' hello from test');
//socket.emit(messages.COMMAND_MESSAGE, common.CMD_NORTH);
//socket.emit(messages.COMMAND_MESSAGE, common.CMD_SOUTH);
//socket.emit(messages.COMMAND_MESSAGE, common.CMD_CHAT + ' I\'m back!');


socket.on(messages.RESPONSE_MESSAGE, function(msg) {
  console.log("socket message: ", msg);
});


