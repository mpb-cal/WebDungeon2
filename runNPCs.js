/////////////////////////////////////////////
// runs a bunch of NPCs
/////////////////////////////////////////////

const io = require('socket.io-client');
const socket = io('http://localhost:5500');
const messages = require('./static/messages');
const common = require('./common');

//socket.emit(messages.COMMAND_MESSAGE, common.CMD_CHAT + ' I\'m back!');


socket.on(messages.RESPONSE_MESSAGE, function(msg) {
  //console.log("socket message: ", msg);
});

runNPCs();

/*
let i = 1;
for (let x=90; x<=110; x++) {
	if (x != 100) {
		sendCommand( "admin create_npc troll_$i" );
		sendCommand( "troll_$i setPosition $x 89" );
		i++;
	}
}
*/

async function runNPCs() {
  while (true) {
    switch (Math.floor(Math.random() * 10)) {
    case 0:
      //sendCommand( "$name north" );
      socket.emit(messages.COMMAND_MESSAGE, common.CMD_NORTH);
      break;

    case 1:
      socket.emit(messages.COMMAND_MESSAGE, common.CMD_SOUTH);
      break;

    case 2:
      socket.emit(messages.COMMAND_MESSAGE, common.CMD_EAST);
      break;

    case 3:
      socket.emit(messages.COMMAND_MESSAGE, common.CMD_WEST);
      break;

    default:
      //sendCommand( "$name ping" );
      socket.emit(messages.COMMAND_MESSAGE, common.CMD_CHAT + ' Hello from a bot');
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000 + 1000));
  }
}

