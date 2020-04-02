const socket = io();
const e = React.createElement;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Form = ReactBootstrap.Form;
const Overlay = ReactBootstrap.Overlay;
const Button = ReactBootstrap.Button;

function sendCommand(username, password, cmd) {
  socket.emit(messages.COMMAND_MESSAGE, username, password, cmd);
}

class GamePanel extends React.Component {
  constructor(props) {
    super(props);
    this.handleSocket = this.handleSocket.bind(this);
    this.onSubmitCommand = this.onSubmitCommand.bind(this);
    this.onChangeCmdInput = this.onChangeCmdInput.bind(this);
    this.state = {
      character: {
        name : '',
      },
      messageList: [],
      occupants: [],
      location_: '',
      bgColor: '',
      command: '',
    };
    this.cmdInputRef = React.createRef();
    this.messagePanelRef = React.createRef();
    this.username = 'mpb';
    this.password = '123';
  }

  appendMessage(msg) {
    this.setState((state) => {
      let messageList = state.messageList;
      messageList.push(msg);
      
      return {
        messageList,
      };
    });

    this.messagePanelRef.current.scrollTop = this.messagePanelRef.current.scrollHeight;
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
      } else if (msg.character) {
        this.setState({
          character: {
            name: msg.character.name, 
          }
        });
      } else if (msg.room) {
        this.setState({
          location_: msg.room.description, 
          bgColor: msg.room.bgColor,
        });
      } else if (msg.occupants) {
        this.setState({
          occupants: msg.occupants.filter(
            (e, i, a) => (e.username !== this.state.character.name)
          ),
        });
      }
    }
  }

  componentDidMount() {
    socket.on(messages.RESPONSE_MESSAGE, this.handleSocket);
    this.cmdInputRef.current.focus();
    // send our 1st command
    sendCommand(this.username, this.password, 'look');
  }

  onChangeCmdInput(event) {
    this.setState({
      command: event.target.value,
    });
  }

  onSubmitCommand(event) {
    event.preventDefault();
    const cmd = this.state.command;
    if (cmd === '') {
      return;
    }
    this.setState({
      command: '',
    });
    sendCommand(this.username, this.password, cmd);
  }

  render() {
    return (
      <ReactBootstrap.Container fluid={true}>
        <Row className="fixed-top">
          <Col>
            <Form action="" onSubmit={this.onSubmitCommand}>
              <Form.Control type="text" id="m" value={this.state.command} autoComplete="off" ref={this.cmdInputRef} onChange={this.onChangeCmdInput} />
            </Form>
          </Col>
        </Row>
        <Row noGutters={true}>
          <Col sm={6}>
            <LocationPanel 
              location_={this.state.location_} 
              bgColor={this.state.bgColor}
              doCommand={(cmd) => sendCommand(this.username, this.password, cmd)}
            >
            </LocationPanel>
          </Col>
          <Col sm={6}>
            <CharacterPanel character={this.state.character}>
            </CharacterPanel>
            <OccupantsPanel occupants={this.state.occupants}>
            </OccupantsPanel>
          </Col>
        </Row>
        <Row noGutters={true}>
          <Col sm={6}>
            <MessagePanel messageList={this.state.messageList} ref={this.messagePanelRef}>
            </MessagePanel>
          </Col>
        </Row>
      </ReactBootstrap.Container>
    );
  }
}

const LocationPanel = ({location_, bgColor, doCommand}) => (
  <div className="location">
    <Row>
      <Col xs={2}>
      </Col>
      <Col xs={8} id="northButton" className="travelButton text-center"
        onClick={() => doCommand('north')}
      >
        NORTH
      </Col>
      <Col xs={2}>
      </Col>
    </Row>
    <Row>
      <Col xs={2} id="westButton" className="travelButton text-center"
        onClick={() => doCommand('west')}
      >
        WEST
      </Col>
      <Col xs={8} style={{backgroundColor: bgColor, }}>
        <h4>
          Your Location:
        </h4>
        {location_}
      </Col>
      <Col xs={2} id="eastButton" className="travelButton text-center"
        onClick={() => doCommand('east')}
      >
        EAST
      </Col>
    </Row>
    <Row>
      <Col xs={2}>
      </Col>
      <Col xs={8} id="southButton" className="travelButton text-center"
        onClick={() => doCommand('south')}
      >
        SOUTH
      </Col>
      <Col xs={2}>
      </Col>
    </Row>
  </div>
);

const MessagePanel = React.forwardRef(({messageList}, ref) => (
  <div className="messages" ref={ref}>
    {messageList.map((e,i) => (
      <Message key={i} message={e}></Message>
    ))}
  </div>
));

const Message = ({message}) => (
  <div className={message.type}>
    {message.text}
  </div>
);

const CharacterPanel = ({character}) => (
  <div className="character">
    <h4>
      You:
    </h4>
    {character.name}
  </div>
);

const OccupantsPanel = ({occupants}) => (
  <div className="occupants">
    <h4>
      Other Occupants:
    </h4>
    {occupants.map((e,i) => (
      <Occupant key={i} occupant={e}></Occupant>
    ))}
  </div>
);

class Occupant extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false,
    };
    this.target = React.createRef();
  }

  render() {
    return (
      <div>
        <span 
          onMouseOver={() => {this.setState({showTooltip: true})}} 
          onMouseOut={() => {this.setState({showTooltip: false})}} 
          ref={this.target}
        >
          {this.props.occupant.username}
        </span>
        <Overlay show={this.state.showTooltip} target={this.target.current} placement="right">
          {({...props}) => (
            <div {...props} className="occupantTooltip">
              Health: {this.props.occupant.health} / 100
            </div>
          )}
        </Overlay>
      </div>
    );
  }
}


function App() {
  return (
    <GamePanel />
  );
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);

