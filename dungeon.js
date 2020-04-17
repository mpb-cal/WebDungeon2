/* eslint-disable no-console*/

//const EventEmitter = require('events');
const dungeonGame = require('./dungeonGame');
const common = require('./common');
const _ = require('underscore');
const path = require('path');

function log(msg) {
  console.log(`${path.basename(__filename)}: ${msg}`);
}

class Dungeon {
  constructor(sendToAllUsers, sendToUser) {
    this.sendToAllUsers = sendToAllUsers;
    this.sendToUser = sendToUser;

    dungeonGame.reset();
    dungeonGame.createUser('test');
    dungeonGame.createUser('mpb');
    dungeonGame.createUser('martin');
    dungeonGame.createUser('isabel');
  }

  sendUpdateToAll(update) {
    this.sendToAllUsers(update);
  }

  sendUpdateToUser(username, update) {
    this.sendToUser(username, update);
  }

  // except is a list of usernames not to send to
  sendUpdateToRoom(x, y, update, except = []) {
    _.difference(dungeonGame.getOccupantNames(x, y), except)
      .forEach((username) => this.sendUpdateToUser(username, update));
  }

  adminCommand(command = '', ...params) {
    log(`adminCommand: ${command} ${params}`);

    /*
    elseif (command == "create_npc")
    {
      $name = $params[0];
      if (!this.isValidUsername( $name ))
        return xmlResponse( 'error: invalid name' );

      $x = 100;
      $y = 100;
      createNPC( $name, $x, $y, array(), 10 );
      this.sendUpdateToRoom( $x, $y, serverNotice( "$name enters the game." ) );
      this.sendUpdateToRoom( $x, $y, getOtherOccupants( $x, $y ) );
      $response = xmlResponse( "ok" );
    }
    elseif (command == "users")
    {
      $text = '';

      foreach (array_keys( $m_users ) as $k)
      {
        $text .= printUser( $k );
      }

      $response = xmlResponse( $text );
    }
    elseif (command == "npcs")
    {
      $text = '';

      foreach (array_keys( $m_npcs ) as $k)
      {
        $text .= printNPC( $k );
      }

      $response = xmlResponse( $text );
    }
    elseif (command == 'rooms')
    {
      $response = xmlResponse( cmdRooms() );
    }
    elseif (command == 'map')
    {
      $response = array( cmdMap() );
    }
    elseif (command == 'openDoor')
    {
      $x = $params[0];
      $y = $params[1];
      $dir = $params[2];

      $x2 = $x;
      $y2 = $y;

      if ($dir == 'north') { $y2--; }
      if ($dir == 'south') { $y2++; }
      if ($dir == 'east') { $x2++; }
      if ($dir == 'west') { $x2--; }

      $m_doors["$x,$y"]["$x2,$y2"] = 1;

      saveDoors();

      $response = array( "<script>location = 'command.php?p_user=mpb&p_command=map'; </script>" );
    }
    elseif (command == 'closeDoor')
    {
      $x = $params[0];
      $y = $params[1];
      $dir = $params[2];

      $x2 = $x;
      $y2 = $y;

      if ($dir == 'north') { $y2--; }
      if ($dir == 'south') { $y2++; }
      if ($dir == 'east') { $x2++; }
      if ($dir == 'west') { $x2--; }

      $m_doors["$x,$y"]["$x2,$y2"] = 0;
      $m_doors["$x2,$y2"]["$x,$y"] = 0;

      saveDoors();

      $response = array( "<script>location = 'command.php?p_user=mpb&p_command=map'; </script>" );
    }
    else
    {
      $response = xmlResponse( "<error>Command command not recognized.</error>" );
    }

    return $response;
    */
  }

  // commands should start with backslash; otherwise they will be treated as chat messages
  playerCommand(username, commandMessage) {
    log(`playerCommand: ${username}, ${commandMessage}`);

    if (!this.isValidUsername(username)) { 
      return {
        error: 'invalid username'
      };
    }

    const user = dungeonGame.getUserByName(username);
    if (!user) {
      return {
        error: 'unknown username'
      };
    }

    let command = commandMessage;
    let params = [];
    const parts = commandMessage.split(/\s+/);
    if (parts) {
      command = parts[0];
      params = parts.slice(1);
    }

    // look for backslash
    const m = command.match(/^\\(.*)$/);
    if (m !== 'undefined' && m !== null) {
      command = m[1];
    } else{
      //const chat = username + ': ' + params.join(' ');
      const chat = username + ': ' + parts.join(' ');
      this.sendUpdateToRoom( user.x, user.y, {chat} );
      return;
    }

    switch (command) {
      case common.CMD_LOOK:
        this.sendUpdateToUser(username, dungeonGame.getPlayersView(username));
        break;

      case common.CMD_WORLD_MAP:
        return {
          text: dungeonGame.getWorldMap()
        };
        break;

      case common.CMD_CHAR_DETAILS:
        const char = params[0];
        return {
          name: char,
        };
        break;

      case common.CMD_NORTH:
      case common.CMD_SOUTH:
      case common.CMD_EAST:
      case common.CMD_WEST:
        const oldX = user.x;
        const oldY = user.y;

        let newX = user.x;
        let newY = user.y;

        if (command == common.CMD_NORTH) { newY--; }
        if (command == common.CMD_SOUTH) { newY++; }
        if (command == common.CMD_EAST) { newX++; }
        if (command == common.CMD_WEST) { newX--; }

        if (dungeonGame.canTravel(user.x, user.y, command)) {
          user.x = newX;
          user.y = newY;

          let ENTERS_FROM = {};
          ENTERS_FROM[common.CMD_NORTH] = 'south';
          ENTERS_FROM[common.CMD_SOUTH] = 'north';
          ENTERS_FROM[common.CMD_EAST] = 'west';
          ENTERS_FROM[common.CMD_WEST] = 'east';

          let EXITS_TO = {};
          EXITS_TO[common.CMD_NORTH] = 'north';
          EXITS_TO[common.CMD_SOUTH] = 'south';
          EXITS_TO[common.CMD_EAST] = 'east';
          EXITS_TO[common.CMD_WEST] = 'west';

          this.sendUpdateToRoom(
            oldX,
            oldY,
            {text: username + ' exits ' + EXITS_TO[command]},
            [username]
          );
          this.sendUpdateToRoom(oldX, oldY, dungeonGame.getRoomState(oldX, oldY));

          this.sendUpdateToRoom(
            newX,
            newY,
            {text: username + ' enters from the ' + ENTERS_FROM[command]},
            [username]
          );
          this.sendUpdateToRoom(newX, newY, dungeonGame.getRoomState(newX, newY));

          return dungeonGame.getPlayersView(username);
        } else {
          return {
            error: 'blocked',
          };
        }
        break;

      default:
        return {
          error: `Command ${command} not recognized.`,
        };
    }

  /*
    elseif (command == 'setPosition')
    {
      $r_userX = $params[0];
      $r_userY = $params[1];

      $response = xmlResponse( 'ok' );
    }
    elseif (preg_match( "/^drop_(.*)$/", command, $m ))
    {
      $dropItem = $m[1];
      $newInv = array();
      $hasIt = 0;

      foreach ($r_userInventory as $item)
      {
        if ($item == $dropItem)
        {
          $hasIt = 1;
        }
        else
        {
          $newInv[] = $item;
        }
      }

      $r_userInventory = $newInv;

      if ($hasIt)
      {
        $r_roomItems[] = $dropItem;

        this.sendUpdateToRoom( $r_userX, $r_userY, printItems( $r_userX, $r_userY ) );
        this.sendUpdateToRoom( $r_userX, $r_userY, serverNotice( "$username drops $dropItem." ) );

        $response = xmlResponse( 'ok' );
      }
      else
      {
        $response = xmlResponse( 'error: invalid item' );
      }
    }
    elseif (preg_match( "/^take_(.*)$/", command, $m ))
    {
      $takeItem = $m[1];
      $newItems = array();
      $hasIt = 0;

      foreach ($r_roomItems as $item)
      {
        if ($item == $takeItem)
        {
          $hasIt = 1;
        }
        else
        {
          $newItems[] = $item;
        }
      }

      $r_roomItems = $newItems;

      if ($hasIt)
      {
        $r_userInventory[] = $takeItem;

        this.sendUpdateToRoom( $r_userX, $r_userY, printItems( $r_userX, $r_userY ) );
        this.sendUpdateToRoom( $r_userX, $r_userY, serverNotice( "$username takes $takeItem." ) );

        $response = xmlResponse( 'ok' );
      }
      else
      {
        $response = xmlResponse( 'error: invalid item' );
      }
    }
    elseif (preg_match( "/^attack_(.*)$/", command, $m ))
    {
      $targetName = $m[1];

      // mpb! make sure valid target

      if (isset( $m_npcs[$targetName] ))
      {
        $damage = rand( 0, 5 );
        $m_npcs[$targetName]['health'] -= $damage;

        $userDamage = rand( 0, 5 );
        $r_userHealth -= $userDamage;

        this.sendUpdateToRoom( $r_userX, $r_userY, serverNotice( "$username attacks $targetName for $damage damage." ) );
        this.sendUpdateToRoom( $r_userX, $r_userY, serverNotice( "$targetName attacks $username for $userDamage damage." ) );

        if ($m_npcs[$targetName]['health'] <= 0)
        {
          this.sendUpdateToRoom( $r_userX, $r_userY, serverNotice( "$username has killed $targetName!" ) );

          $newNPCs = array();
          foreach (array_keys( $m_npcs ) as $k)
          {
            if ($k != $targetName) $newNPCs[$k] = $m_npcs[$k];
          }
          $m_npcs = $newNPCs;
        }

        this.sendUpdateToRoom( $r_userX, $r_userY, getOtherOccupants( $r_userX, $r_userY ) );
        this.sendUpdateToRoom( $r_userX, $r_userY, printNPCs( $r_userX, $r_userY ) );

        $response = xmlResponse( "ok: $damage damage" );
      }
      elseif (isset( $m_users[$targetName] ))
      {
        $damage = rand( 0, 5 );
        $m_users[$targetName]['health'] -= $damage;

        this.sendUpdateToRoom( $r_userX, $r_userY, serverNotice( "$username attacks $targetName for $damage damage." ) );
        sendUpdateTo( $targetName, getGameState( $targetName ) );

        if ($m_users[$targetName]['health'] <= 0)
        {
          this.sendUpdateToRoom( $r_userX, $r_userY, serverNotice( "$username has killed $targetName!" ) );

          $newUsers = array();
          foreach (array_keys( $m_users ) as $k)
          {
            if ($k != $targetName) $newUsers[$k] = $m_users[$k];
          }
          $m_users = $newUsers;
        }

        this.sendUpdateToRoom( $r_userX, $r_userY, getOtherOccupants( $r_userX, $r_userY ) );
        this.sendUpdateToRoom( $r_userX, $r_userY, printNPCs( $r_userX, $r_userY ) );

        $response = xmlResponse( "ok: $damage damage" );
      }
      else
      {
        $response = xmlResponse( "error: invalid target" );
      }
    } else {
      return {
        error: `Command ${command} not recognized.`,
      };
    }
  */
  }

  isValidUsername(username) {
    if (username && username.match(/^[\w-]+$/)) {
      return true;
    }

    return false;
  }
}

/*
function serverNotice( notice )
{
  return "<chat>$notice</chat>";
}

function printRoom( $x, $y )
{
  global $m_rooms;

  $text = "<room>";

  $text .= "<coords>$x, $y</coords>";
  $text .= "<description><![CDATA[" . $m_rooms[$x][$y]['description'] . "]]></description>";
  $text .= printItems( $x, $y );
  $text .= printOccupants( $x, $y );
  $text .= printNPCs( $x, $y );

  $text .= "</room>";

  return $text;
}

function printItems( $roomX, $roomY )
{
  global $m_rooms;

  $text = '<items>';

  $items = $m_rooms[$roomX][$roomY]['items'];

  if ($items) foreach ($items as $i)
  {
    if ($i) $text .= "<item>$i</item>";
  }

  $text .= '</items>';

  return $text;
}

function printInventory( $username )
{
  global $m_users;

  $text = '';

  $inv = $m_users[$username]['inventory'];

  if ($inv) foreach ($inv as $i)
  {
    if ($i) $text .= "<item>$i</item>";
  }

  return $text;
}

function printPlayer( $username, $x, $y )
{
  $text = 
    printUser( $username ) .
    "<inventory>" . printInventory( $username ) . "</inventory>" .
    "<northVisibility>" . (canTravel( $x, $y, 'north' ) ? 'visible' : 'hidden') . "</northVisibility>" .
    "<southVisibility>" . (canTravel( $x, $y, 'south' ) ? 'visible' : 'hidden') . "</southVisibility>" .
    "<eastVisibility>" . (canTravel( $x, $y, 'east' ) ? 'visible' : 'hidden') . "</eastVisibility>" .
    "<westVisibility>" . (canTravel( $x, $y, 'west' ) ? 'visible' : 'hidden') . "</westVisibility>";

  return $text;
}

function printUser( $username )
{
  global $m_users;

  $x = $m_users[$username]['x'];
  $y = $m_users[$username]['y'];
  $health = $m_users[$username]['health'];

  $text = "<user x=\"$x\" y=\"$y\" health=\"$health\">$username</user>";

  return $text;
}


function getOtherOccupants(roomX, roomY, username) {
  return {
    occupants: dungeonGame
      .getOccupants(roomX, roomY)
      .filter((e,i,a) => (e.username !== username))
  };
}

function printNPC( $name )
{
  global $m_npcs;

  $npcX = $m_npcs[$name]['x'];
  $npcY = $m_npcs[$name]['y'];
  $health = $m_npcs[$name]['health'];

  $text = "<npc x=\"$npcX\" y=\"$npcY\" health=\"$health\">$name</npc>";

  return $text;
}

function printNPCs( $roomX, $roomY )
{
  global $m_npcs;

  $text = '<npcs>';

  $names = array_keys( $m_npcs );
  sort( $names );

  foreach ($names as $name)
  {
    $npcX = $m_npcs[$name]['x'];
    $npcY = $m_npcs[$name]['y'];

    if ($npcX == $roomX and $npcY == $roomY)
    {
      $text .= printNPC( $name );
    }
  }

  $text .= '</npcs>';

  return $text;
}

function cmdRooms()
{
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

function doorLink( $x, $y, $dir )
{
  if (canTravel( $x, $y, $dir ))
    return "<a href=\"command.php?p_user=mpb&p_command=closeDoor&p_params=$x $y $dir\">close</a>";
  else
    return "<a href=\"command.php?p_user=mpb&p_command=openDoor&p_params=$x $y $dir\">open</a>";
}

function cmdMap()
{
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

module.exports = Dungeon;


