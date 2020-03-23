'use strict';

$(function() {
  document.getElementById('m').focus();

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

    const text = response.text;
    if (text) {
      appendMessage(response.text);
    }
  });

  function appendMessage(msg) {
    let d = $('<div>');
    d.append(msg);
    $('#messages').append(d);
    $('html, body').scrollTop( $(document).height() );
  }

  socket.emit(messages.COMMAND_MESSAGE, 'look');
});


