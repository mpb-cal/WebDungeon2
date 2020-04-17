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
      command: '',
      room: {
        description: '',
        bgColor: '',
        occupants: [],
        items: [],
      },
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
      } 
      
      if (msg.text) {
        this.appendMessage({type: 'text', text: msg.text});
      } 
      
      if (msg.chat) {
        this.appendMessage({type: 'chat', text: msg.chat});
      } 
      
      if (msg.player) {
        this.setState({
          character: {
            name: msg.player.name, 
          }
        });
      } 
      
      if (msg.room) {
        let room = {...msg.room};
        room.occupants = room.occupants.filter(
          (e, i, a) => (e.username !== this.state.character.name)
        );

        this.setState({
          room
        });
      }
    }
  }

  componentDidMount() {
    socket.on(messages.RESPONSE_MESSAGE, this.handleSocket);
    this.cmdInputRef.current.focus();
    // send our 1st command
    sendCommand(this.username, this.password, '\\look');
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

  chatControl() {
    return (
      <Form action="" onSubmit={this.onSubmitCommand}>
        <Form.Group controlId="m">
          <Form.Row>
            <Form.Label>Chat: </Form.Label>
            <Col>
              <Form.Control type="text" id="m" value={this.state.command} autoComplete="off" ref={this.cmdInputRef} onChange={this.onChangeCmdInput} />
            </Col>
          </Form.Row>
        </Form.Group>
      </Form>
    );
  }

  render() {
    return (
      <ReactBootstrap.Container fluid={true}>
        <Row noGutters={true}>
          <Col sm={6}>
            <LocationPanel 
              room={this.state.room} 
              doCommand={(cmd) => sendCommand(this.username, this.password, cmd)}
            >
            </LocationPanel>
          </Col>
          <Col sm={6}>
            <CharacterPanel character={this.state.character}>
            </CharacterPanel>
            <OccupantsPanel occupants={this.state.room.occupants}>
            </OccupantsPanel>
            <ItemsPanel items={this.state.room.items}>
            </ItemsPanel>
          </Col>
        </Row>
        <Row noGutters={true} className="pt-3">
          <Col sm={6}>
            {this.chatControl()}
            <MessagePanel messageList={this.state.messageList} ref={this.messagePanelRef}>
            </MessagePanel>
          </Col>
        </Row>
      </ReactBootstrap.Container>
    );
  }
}

const TravelButton = ({col, isOpen, onClick, text}) => (
  <Col xs={col} className="travelButton text-center"
    disabled={!isOpen}
    onClick={isOpen ? onClick : null}
  >
    {text}
  </Col>
);

const LocationPanel = ({room, doCommand}) => (
  <div className="location">
    <Row>
      <Col xs={2}>
      </Col>
      <TravelButton
        col={8}
        isOpen={room.northDoor === 'open'}
        onClick={() => doCommand("\\north")}
        text="NORTH"
      />
      <Col xs={2}>
      </Col>
    </Row>
    <Row>
      <TravelButton
        col={2}
        isOpen={room.westDoor === 'open'}
        onClick={() => doCommand("\\west")}
        text="WEST"
      />
      <Col xs={8} style={{backgroundColor: room.bgColor, }}>
        <h4>
          Your Location:
        </h4>
        {room.description}
      </Col>
      <TravelButton
        col={2}
        isOpen={room.eastDoor === 'open'}
        onClick={() => doCommand("\\east")}
        text="EAST"
      />
    </Row>
    <Row>
      <Col xs={2}>
      </Col>
      <TravelButton
        col={8}
        isOpen={room.southDoor === 'open'}
        onClick={() => doCommand("\\south")}
        text="SOUTH"
      />
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

const ItemsPanel = ({items}) => (
  <div className="items">
    <h4>
      Items Here:
    </h4>
    {items.map((e,i) => (
      <Item key={i} item={e}></Item>
    ))}
  </div>
);

class Item extends React.Component {
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
          {this.props.item.name}
        </span>
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

