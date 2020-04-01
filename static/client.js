const socket = io();
const e = React.createElement;
let Row = ReactBootstrap.Row;
let Col = ReactBootstrap.Col;
let Form = ReactBootstrap.Form;

class GamePanel extends React.Component {
  constructor(props) {
    super(props);
    this.handleSocket = this.handleSocket.bind(this);
    this.onSubmitForm = this.onSubmitForm.bind(this);
    this.onChangeCmdInput = this.onChangeCmdInput.bind(this);
    this.state = {
      messageList: [],
      occupants: [],
      command: '',
    };
    this.cmdInputRef = React.createRef();
  }

  appendMessage(msg) {
    this.setState((state) => {
      let messageList = state.messageList;
      messageList.push(msg);
      
      return {
        messageList,
      };
    });

    document.querySelector('html').scrollTop = document.body.clientHeight;
    document.querySelector('body').scrollTop = document.body.clientHeight;
  }

  handleSocket(msg) {
    console.log("server message: ", msg);
    if (msg) {
      if (msg.error) {
        alert(msg.error);
      } else if (msg.text) {
        this.appendMessage({type: 'text', text: msg.text});
      } else if (msg.chat) {
        this.appendMessage({type: 'chat', text: msg.chat});
      } else if (msg.room) {
        this.appendMessage({
          type: 'text', 
          text: msg.room.description, 
          bgColor: msg.room.bgColor,
          occupants: msg.room.occupants,
        });
      } else if (msg.occupants) {
        this.setState({
          occupants: msg.occupants,
        });
      }
    }
  }

  componentDidMount() {
    socket.on(messages.RESPONSE_MESSAGE, this.handleSocket);
    this.cmdInputRef.current.focus();
    // send our 1st command
    socket.emit(messages.COMMAND_MESSAGE, 'look');
  }

  onChangeCmdInput(event) {
    this.setState({
      command: event.target.value,
    });
  }

  onSubmitForm(event) {
    const cmd = this.state.command;
    this.setState({
      command: '',
    });
    socket.emit(messages.COMMAND_MESSAGE, cmd);
    event.preventDefault();
  }

  render() {
    return (
      <ReactBootstrap.Container fluid={true}>
        <Row className="fixed-top">
          <Col>
            <Form action="" onSubmit={this.onSubmitForm}>
              <Form.Control type="text" id="m" value={this.state.command} autoComplete="off" ref={this.cmdInputRef} onChange={this.onChangeCmdInput} />
            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
            <MessagePanel messageList={this.state.messageList}>
            </MessagePanel>
          </Col>
          <Col>
            <OccupantsPanel occupants={this.state.occupants}>
            </OccupantsPanel>
          </Col>
        </Row>
      </ReactBootstrap.Container>
    );
  }
}

const MessagePanel = ({messageList}) => (
  <div id="messages">
    {messageList.map((e,i) => (
      <Message key={i} message={e}></Message>
    ))}
  </div>
);

const Message = ({message}) => (
  <div className={message.type} style={message.bgColor && {backgroundColor: message.bgColor, }}>
    {message.text}
  </div>
);

const OccupantsPanel = ({occupants}) => (
  <div id="occupants">
    {occupants.map((e,i) => (
      <Occupant key={i} occupant={e}></Occupant>
    ))}
  </div>
);

const Occupant = ({occupant}) => (
  <div>
    {occupant.username}
  </div>
);


function App() {
  return (
    <GamePanel />
  );
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);

