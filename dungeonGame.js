
/* eslint-disable no-console */

const path = require('path');
const util = require('./util');
const common = require('./common');
const worldMap = require('./worldMap');

const DATA_DIR = '_data';
const ROOMS_JSON = DATA_DIR + '/rooms.json';
const DOORS_JSON = DATA_DIR + '/doors.json';
const USER_START_X = 100;
const USER_START_Y = 100;
const USER_START_HEALTH = 100;

//let m_rooms = [];
let m_doors = {};
let m_users = {};
let m_npcs = {};

function log(msg) {
  console.log(`${path.basename(__filename)}: ${msg}`);
}

/**
 * Resets the game.
 */
function reset() {
/*
  // load rooms
  m_rooms = util.readJSONFile(ROOMS_JSON);

  //util.writeJSONFile(ROOMS_JSON, m_rooms);
  saveRooms();
*/

  // load doors
  m_doors = util.readJSONFile(DOORS_JSON);

  //saveDoors();

  // load users
  m_users = {};
}

/*
function saveRooms() {
  util.writeJSONFile(ROOMS_JSON, m_rooms);
}
*/

/**
 * Returns a user looked up by its name.
 * @param {string} name - The name of the user.
 * @returns {Object} - The user.
 */
function getUserByName(name) {
  return m_users[name];
}

function getUsers() {
  return m_users;
}

function getUsernames() {
  return Object.keys(m_users);
}

/**
 * Creates a new user in the game.
 * @param {string} username - The name of the user. Avoid same name as an NPC.
 */
function createUser(username) {
  log(`Adding user ${username}`);

  m_users[username] = {
    x: USER_START_X,
    y: USER_START_Y,
    inventory: [],
    health: USER_START_HEALTH,
  };
}

function dropUser(username) {
  log(`Dropping user ${username}`);

  delete m_users[username];
}

// mpb! avoid same name as user
/**
 * Creates a new non-player character (NPC) in the game.
 * @param {Object} npc - The NPC.
 * @param {string} npc.name - The name of the NPC. Avoid same name as a player user.
 * @param {number} npc.x - The npc's starting X position.
 * @param {number} npc.y - The npc's starting Y position.
 * @param {array} npc.inventory - The npc's starting inventory.
 * @param {number} npc.health - The npc's starting health (1 - 100).
 */
function createNPC(npc) {
  log(`Adding npc ${npc.name}`);

  m_npcs[npc.name] = {
    x: npc.x,
    y: npc.y,
    inventory: npc.inventory,
    health: npc.health,
  };
}

function getWorldMap() {
  let roomList = '';

  [...worldMap.rooms.keys()].forEach((x) => {
    if (typeof worldMap.rooms[x] !== 'undefined') {
      [...worldMap.rooms[x].keys()].forEach((y) => {
        if (typeof worldMap.rooms[x][y] !== 'undefined') {
          const room = worldMap.rooms[x][y];
          roomList += `${x}, ${y}: ${room.description} Items: ${room.items}<br>`;
        }
      });
    }
  });

  return roomList;
}

/**
 */
function getPlayersView(username) {
  const user = getUserByName(username);

  return {
    room: getRoomState(user.x, user.y),
    //player: printPlayer(username, user.x, user.y )
  };
}

/**
 */
function getRoom(x, y) {
  if (typeof worldMap.rooms[x] !== 'undefined') {
    return worldMap.rooms[x][y];
  }
}

/**
 */
function getRoomState(x, y) {
  const room = getRoom(x, y);

  return {
    coords: {x: x, y: y},
    description: (typeof room === 'undefined' ? '' : room.description),
    items: (typeof room === 'undefined' ? '' : room.items),
    bgColor: (typeof room === 'undefined' ? '' : room.bgColor),
    //occupants: getOccupants(x, y),
    npcs: getNPCs(x, y),
  };
}

function usernameToOccupant(username) {
  return { username: username, health: m_users[username].health };
}

function getOccupantNames( roomX, roomY ) {
  return Object.keys(m_users) // list of usernames
    .filter(e => m_users[e].x == roomX && m_users[e].y == roomY)  // only those in this room
  ;
}

function getOccupants( roomX, roomY ) {
  return getOccupantNames( roomX, roomY )
    .sort()
    .map(e => usernameToOccupant(e))  // converted to list of occupant objects
  ;
}

function npcnameToNPC(npcname) {
  const npc = m_npcs[npcname];
  return { username: npcname, x: npc.x, y: npc.y, health: npc.health };
}

function getNPCs(roomX, roomY) {
  return Object.keys(m_npcs) // list of usernames
    .sort() // sorted alphabetically
    .filter(e => m_npcs[e].x == roomX && m_npcs[e].y == roomY)  // only those in this room
    .map(e => npcnameToNPC(e))  // converted to list of npc objects
  ;
}

function canTravel(fromX, fromY, direction) {
  let newX = fromX;
  let newY = fromY;

  if (direction == common.CMD_NORTH) { newY--; }
  if (direction == common.CMD_SOUTH) { newY++; }
  if (direction == common.CMD_EAST) { newX++; }
  if (direction == common.CMD_WEST) { newX--; }

  if (!worldMap.rooms[newX]) return false;
  if (!worldMap.rooms[newX][newY]) return false;

  const idx1 = fromX + ',' + fromY;
  const idx2 = newX + ',' + newY;

  if (
    (m_doors[idx1] && m_doors[idx1][idx2]) ||
    (m_doors[idx2] && m_doors[idx2][idx1])
  ) {
    return true;
  }

  return false;
}

/*
function saveDoors() {
  util.writeJSONFile(DOORS_JSON, m_doors);
}

function serverNotice( $notice ) {
  return "<chat>$notice</chat>";
}

function sendUpdateToRoom( $x, $y, $update ) {
  global $m_users;

  $updateNames = array();

  $usernames = array_keys( $m_users );
  sort( $usernames );

  foreach ($usernames as $username)
  {
    $userX = $m_users[$username]['x'];
    $userY = $m_users[$username]['y'];

    if (
      $userX == $x and 
      $userY == $y
    )
    {
      array_push( $updateNames, $username );
    }
  }

  foreach ($updateNames as $username)
  {
    sendUpdateTo( $username, $update );
  }
}

function printInventory( $username ) {
  global $m_users;

  $text = '';

  $inv = $m_users[$username]['inventory'];

  if ($inv) foreach ($inv as $i)
  {
    if ($i) $text .= "<item>$i</item>";
  }

  return $text;
}

function printPlayer( $username, $x, $y ) {
  $text = 
    printUser( $username ) .
    "<inventory>" . printInventory( $username ) . "</inventory>" .
    "<northVisibility>" . (canTravel( $x, $y, 'north' ) ? 'visible' : 'hidden') . "</northVisibility>" .
    "<southVisibility>" . (canTravel( $x, $y, 'south' ) ? 'visible' : 'hidden') . "</southVisibility>" .
    "<eastVisibility>" . (canTravel( $x, $y, 'east' ) ? 'visible' : 'hidden') . "</eastVisibility>" .
    "<westVisibility>" . (canTravel( $x, $y, 'west' ) ? 'visible' : 'hidden') . "</westVisibility>";

  return $text;
}

function printUser( $username ) {
  global $m_users;

  $x = $m_users[$username]['x'];
  $y = $m_users[$username]['y'];
  $health = $m_users[$username]['health'];

  $text = "<user x=\"$x\" y=\"$y\" health=\"$health\">$username</user>";

  return $text;
}

function cmdRooms() {
  global $m_rooms;

  $text = "<rooms>";

  foreach (array_keys( $m_rooms ) as $x)
  {
    foreach (array_keys( $m_rooms[$x] ) as $y)
    {
      $text .= printRoom( $x, $y );
    }
  }

  $text .= "</rooms>";

  return $text;
}

function doorLink( $x, $y, $dir ) {
  if (canTravel( $x, $y, $dir ))
    return "<a href=\"command.php?p_user=mpb&p_command=closeDoor&p_params=$x $y $dir\">close</a>";
  else
    return "<a href=\"command.php?p_user=mpb&p_command=openDoor&p_params=$x $y $dir\">open</a>";
}

function cmdMap() {
  global $m_rooms, $m_users, $m_npcs;

  $text = '';
  $text .= '<head>';
  $text .= '<title>Web Dungeon Map</title>';
  $text .= '<style type="text/css">td { font-family: monospace; font-size: 8pt; }</style>';
  $text .= '</head>';
  $text .= '<body><center>';
  $text .= '<table border=0 style="border-collapse: collapse; ">';

  $xs = array_keys( $m_rooms );
  sort( $xs, SORT_NUMERIC );

  $openXs = array();
  $openYs = array();

  foreach ($xs as $x)
  {
    $ys = array_keys( $m_rooms[$x] );
    sort( $ys, SORT_NUMERIC );

    foreach ($ys as $y)
    {
      if (canTravel( $x, $y, 'north' ) or
        canTravel( $x, $y, 'south' ) or
        canTravel( $x, $y, 'east' ) or
        canTravel( $x, $y, 'west' ))
      {
        $openXs[] = $x;
        $openYs[] = $y;
      }
    }
  }

  if ($openXs and $openYs)
  {
    sort( $openXs, SORT_NUMERIC );
    $minX = $openXs[0];
    $maxX = $openXs[count( $openXs ) - 1];

    sort( $openYs, SORT_NUMERIC );
    $minY = $openYs[0];
    $maxY = $openYs[count( $openYs ) - 1];
  }
  else
  {
    $minX = 0;
    $maxX = 200;
    $minY = 0;
    $maxY = 200;
  }

  for ($y=$minY; $y<=$maxY; $y++)
  {
    $text .= '<tr>';

    for ($x=$minX; $x<=$maxX; $x++)
    {
      if (isset( $m_rooms[$x][$y] ))
      {
        $text .= '<td valign=top align=center style="width: 130px; ';

        if (!canTravel( $x, $y, 'north' )) $text .= 'border-top: 1px solid black; ';
        if (!canTravel( $x, $y, 'south' )) $text .= 'border-bottom: 1px solid black; ';
        if (!canTravel( $x, $y, 'east' )) $text .= 'border-right: 1px solid black; ';
        if (!canTravel( $x, $y, 'west' )) $text .= 'border-left: 1px solid black; ';

        $text .= ' ">';
        $text .= '<table border=0>';

        // 1st row

        $text .= '<tr>';
        $text .= '<td><td align=center>';
        $text .= doorLink( $x, $y, 'north' );
        $text .= '<td>';
        $text .= '</tr>';
        
        // 2nd row
        
        $text .= '<tr><td>';
        $text .= doorLink( $x, $y, 'west' );

        $text .= '<td>';
        $id = $m_rooms[$x][$y]['id'];
        $text .= "$x, $y ($id)<br>";
        $text .= $m_rooms[$x][$y]['description'] . '<br>';

        $items = $m_rooms[$x][$y]['items'];
        if ($items) foreach ($items as $i)
        {
          $text .= "$i, ";
        }
        $text .= '<br>';

        foreach (array_keys( $m_users ) as $username)
        {
          $userX = $m_users[$username]['x'];
          $userY = $m_users[$username]['y'];
          $userHealth = $m_users[$username]['health'];

          if ($userX == $x and $userY == $y)
          {
            $text .= "$username, ";
          }
        }
        $text .= '<br>';

        foreach (array_keys( $m_npcs ) as $name)
        {
          $userX = $m_npcs[$name]['x'];
          $userY = $m_npcs[$name]['y'];
          $userHealth = $m_npcs[$name]['health'];

          if ($userX == $x and $userY == $y)
          {
            $text .= "$name, ";
          }
        }
        $text .= '<br>';

        $text .= '<td>';
        $text .= doorLink( $x, $y, 'east' );
        $text .= '</tr>';
        
        // 3rd row
        $text .= '<tr>';
        $text .= '<td><td align=center>';
        $text .= doorLink( $x, $y, 'south' );
        $text .= '<td>';
        $text .= '</tr>';
        $text .= '</tr>';
        $text .= '</table>';
      }
      else
      {
      }
    }

    $text .= '</tr>';
  }

  $text .= '</table>';

  return $text;
}


*/

module.exports = {
  reset,
  createUser,
  dropUser,
  getUserByName,
  getUsers,
  createNPC,
  getPlayersView,
  canTravel,
  getUsernames,
  getOccupants,
  getOccupantNames,
  getWorldMap,
};

