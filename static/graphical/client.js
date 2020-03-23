'use strict';

$(function() {
  $('#m').focus();

  const socket = io();

  $('form').submit( function() {
    const msg = $('#m').val();
    socket.emit(messages.COMMAND_MESSAGE, msg);
    $('#m').val('');
    return false;
  });

  socket.on(messages.RESPONSE_MESSAGE, function(response) {
    const error = response.error;
    if (error) {
      alert(error);
    }

    const room = response.room;
    if (room) {
      $('#roomDescription').html(room.description);
      const items = room.items.join(', ');
      $('#items').html(items || 'none');
    }

    appendMessage(JSON.stringify(response));
  });

  function appendMessage(msg) {
    let d = $('<div>');
    d.append(msg);
    $('#messages').append(d);
    $('html, body').scrollTop( $(document).height() );
  }

  socket.emit(messages.COMMAND_MESSAGE, 'look');
});


