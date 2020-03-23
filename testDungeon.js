'use strict';

/* eslint-disable no-console */

const Dungeon = require('./dungeon');
const common = require('./common');
//const util = require('./util');

const dungeon = new Dungeon;

dungeon.on(dungeon.SEND_TO_ALL_USERS, (message) => {
  console.log(`sendToAllUsers: ${message}`);
});

dungeon.on(dungeon.SEND_TO_USER, (username, message) => {
  console.log(`sendToUser: ${username}, ${message}`);
});

const testCmd = (function () {
  let commandCounter = 0;

  return function (cmd) {
    commandCounter++;
    console.log(`${commandCounter}. ${cmd}`);

    const response = dungeon.playerCommand(common.TEST_USER, cmd);
    console.log('response:');
    console.dir(response, {depth: null, colors: true});
    console.log();
  };
})();

const response = dungeon.adminCommand('resetGame');
console.log('response:');
console.dir(response, {depth: null, colors: true});
console.log();

testCmd( 'look' );
testCmd( 'charDetails ' + common.TEST_USER );
testCmd( 'north' );
testCmd( 'east' );
testCmd( 'east' );
testCmd( 'east' );
testCmd( 'chat p1 p2' );
testCmd( 'drop_sword' );
//testCmd( 'drop_helm' );
testCmd( 'look' );
//testCmd( 'take_sword' );
//testCmd( 'take_helm' );
//createNPC( 'troll_1', 100, 100, array(), 10 );
//createNPC( 'troll_2', 100, 100, array(), 10 );
//testCmd( 'setPosition 100 100' );
//testCmd( 'look' );
//testCmd( 'attack_troll_1' );
//testCmd( 'attack_troll_1' );
//testCmd( 'attack_troll_1' );
//testCmd( 'attack_troll_1' );
//testCmd( 'attack_troll_1' );
//testCmd( 'attack_troll_1' );
//testCmd( 'attack_troll_1' );
//testCmd( 'look' );
//testCmd( 'rooms' );
//testCmd( 'openDoor 91 93 north' );
//testCmd( 'closeDoor 91 93 north' );


