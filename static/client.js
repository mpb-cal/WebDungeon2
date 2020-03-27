const socket = io();
const e = React.createElement;

$(function() {
  document.getElementById('m').focus();

  // send message from chat control
  $('form').submit( function() {
    const msg = $('#m').val();
    socket.emit(messages.COMMAND_MESSAGE, msg);
    $('#m').val('');
    return false;
  });
});

class GamePanel extends React.Component {
  constructor(props) {
    super(props);
    this.handleSocket = this.handleSocket.bind(this);
    this.state = {
      messageList: [1, 2, 3],
    };
  }

  appendMessage(msg) {
    this.setState((state, props) => {
      let messageList = state.messageList;
      messageList.push(msg);
      
      return {
        ...state,
        messageList,
      };
    });
    //$('html, body').scrollTop( $(document).height() );
  }

  handleSocket(msg) {
    console.log("server message: ", msg);
    msg.error && alert(msg.error);
    msg.text && this.appendMessage(msg.text);
    //msg.chat && this.appendMessage('<span class="chat">' + msg.chat + '</span>');
  }

  componentDidMount() {
    socket.on(messages.RESPONSE_MESSAGE, this.handleSocket);
  }

  render() {
    return (
      <MessagePanel messageList={this.state.messageList}>
      </MessagePanel>
    );
  }
}

const MessagePanel = ({messageList}) => (
  <div id="messages">
    {messageList.map((e,i) => (<Message key={i}>{e}</Message>))}
  </div>
);

const Message = (props) => (
  <div className="message">
    {props.children}
  </div>
);

function App() {
  // send our 1st command
  //socket.emit(messages.COMMAND_MESSAGE, 'look');

  return (
    <GamePanel />
  );
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);

