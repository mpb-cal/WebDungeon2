
$(function() {
  document.getElementById('m').focus();

  const socket = io();

  // send our 1st command
  socket.emit(messages.COMMAND_MESSAGE, 'look');

  // send message from chat control
  $('form').submit( function() {
    const msg = $('#m').val();
    socket.emit(messages.COMMAND_MESSAGE, msg);
    $('#m').val('');
    return false;
  });

  // receive message and display it
  socket.on(messages.RESPONSE_MESSAGE, function(msg) {
    console.log("socket message: ", msg);
    msg.error && alert(msg.error);
    msg.text && appendMessage(msg.text);
    msg.chat && appendChatMessage(msg.chat);
  });

  function appendMessage(msg) {
    let d = $('<div>');
    d.append(msg);
    $('#messages').append(d);
    $('html, body').scrollTop( $(document).height() );
  }

  function appendChatMessage(msg) {
    let d = $('<div>');
    d.append(msg);
    $('#chat-messages').append(d);
    $('html, body').scrollTop( $(document).height() );
  }
});


