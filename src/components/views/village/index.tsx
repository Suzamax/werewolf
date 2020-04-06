import * as React from "react";
import * as io from 'socket.io-client';
import Container from '@material-ui/core/Container';
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";

type message = {
    msg: string,
    server: boolean,
    nick: string | undefined,
    wolf: boolean
}

type VillageState = {
    generalSocket: SocketIOClient.Socket,
    wolvesSocket: SocketIOClient.Socket | undefined,
    role: string,
    nick: string,
    room: string,
    wolf: boolean,
    messages: message[]
}

export default class Village extends React.Component<{}, VillageState> {
    getGeneralMessagesInterval: NodeJS.Timeout | undefined;
    getAliveInterval: NodeJS.Timeout | undefined;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            generalSocket: io.connect(window.location.host + '/general'),
            wolvesSocket: undefined,
            room: window.location.hash,
            nick: "villager" + new Date().getTime().toString(),
            role: 'Player',
            wolf: false,
            messages: []
        };
        this.joinRoom(this.state.room, this.state.nick);
        this.getGeneralMessagesInterval = undefined;
        this.roomListener();
        this.getAliveInterval = undefined;
    }

    joinRoom = (r: string, n: string) => {
        this.state.generalSocket.emit('join room', r, n);
        this.state.generalSocket.on('connect', () => 
            this.state.generalSocket.emit('new connection', n));
    }

    isAlive = () => this.state.generalSocket.emit('ping');

    roomListener = () => {

        this.state.generalSocket.on('chat message', (nick: string, msg: string) => {
            this.state.messages.push({ msg: msg, wolf: false, server: false, nick: nick });
            console.log("ey listen!");
        });

        this.state.generalSocket.on('role assignation', (r: string) => {
            this.setState({
                role: r,
                wolf: r == 'Werewolf'
            });
            this.state.messages.push({ msg: 'Your role is now ' + r + '!', server: true, wolf: false, nick: undefined });

            if (r == "Werewolf" || r == "Game Master") {

                this.setState({
                    wolvesSocket: io.connect(window.location.host + '/wolves')
                });

                
                this.state.wolvesSocket?.on('connect', () =>
                    this.state.wolvesSocket?.emit('join wolves', this.state.room));
                this.state.wolvesSocket?.on('wolf message', (nick: string, msg: string) => {
                    this.state.messages.push({ msg: msg, wolf: true, server: false, nick: nick })
                });
            }
        });

        this.state.generalSocket.on('game aborted', () => 
            this.state.messages.push({ msg: 'Game aborted! Reload page.', server: true, wolf: false, nick: undefined }));

        this.state.generalSocket.on('no role available', () =>
            this.state.messages.push({ msg: 'No role available.', server: true, wolf: false, nick: undefined }));

        this.state.generalSocket.on('gamemaster', () =>
            this.state.messages.push({ msg: 'You have created the game!', server: true, wolf: false, nick: undefined }));

        this.state.generalSocket.on('nick changed', (oldNick: string, newNick: string) =>
            this.state.messages.push({ msg: oldNick + ' is now ' + newNick, server: true, wolf: false, nick: undefined }));

        // TODO Poll the server outside this function 
        //this.state.generalSocket.on('get identities', (msg) =>
        // TODO Call pollIdentities
        
        this.state.generalSocket.on('leaving', (nick: string) =>
            this.state.messages.push({ msg: nick + ' left.', server: true, wolf: false, nick: undefined }));

    }

    pollIdentities = () => {
        if (this.state.role == 'Game Master')
            console.log("I'm Game Master!");
    }

    componentDidMount = () => {
        console.log("Mounted");

        this.setState({
            room: window.location.hash.toString(),
            nick: "villager" + new Date().getTime().toString(),
            role: 'Player'
        });
        this.setupBeforeUnloadListener();
        this.getGeneralMessagesInterval = setInterval(() => this.roomListener(), 100);
        this.getAliveInterval = setInterval(() => this.isAlive(), 800);
    }

    setupBeforeUnloadListener = () => {
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            this.state.generalSocket.emit('disconnection', this.state.room, this.state.nick);
        });
    };

            

    // TODO Add Dashboard, improve chat
    render() {
        return (       
            <main>
                <Container>
                    <h1>{ this.state.role }</h1>
                    <h2>{this.state.nick} @ { this.state.room }</h2>

                    <Paper square>
                        <Typography variant="h5" gutterBottom>
                        Chat and server logs
                        </Typography>
                        <List>
                        {this.state.messages.map(({ msg, server, nick, wolf }) => (
                            <React.Fragment>
                            <ListItem button>
                                <ListItemText color={server ? 'primary' : wolf ? 'error' : 'initial'} primary={nick} secondary={msg}  />
                            </ListItem>
                            </React.Fragment>
                        ))}
                        </List>
                    </Paper>                        
                </Container>
            </main>
        )
    }
}