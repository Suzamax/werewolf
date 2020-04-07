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
import Grid from "@material-ui/core/Grid";

type message = {
    msg: string,
    server: boolean,
    nick: string | undefined,
    wolf: boolean
}

type VillageState = {
    //generalSocket: SocketIOClient.Socket,
    //wolvesSocket: SocketIOClient.Socket | undefined,
    role: string,
    room_ready: boolean,
    nick: string,
    room: string,
    wolf: boolean,
    messages: message[],
    msg: string
}

export default class Village extends React.Component<{}, VillageState> {
    getGeneralMessagesInterval: NodeJS.Timeout | undefined;

    generalSocket: SocketIOClient.Socket | undefined;
    wolvesSocket: SocketIOClient.Socket | undefined;

    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            //generalSocket: io.connect(window.location.host + '/general'),
            //wolvesSocket: undefined,
            room: window.location.hash,
            room_ready: false,
            nick: "villager" + new Date().getTime().toString(),
            role: 'Viewer',
            wolf: false,
            messages: [],
            msg: ''
        };
        this.getGeneralMessagesInterval = undefined;
    }

    roomListener() {

        this.setState({
            room_ready: true
        });

        var self = this;

        console.log('connecting...');

        this.generalSocket = io('ws://' + window.location.host + '/general');

        this.generalSocket.emit('join room', this.state.room, this.state.nick);

        this.generalSocket.on('connect', function() { 
            console.log('connected!');
            self.generalSocket?.emit('new connection', self.state.nick);
        }.bind(this));

        this.generalSocket.on('welcome message', function(nick: string) {
            self.state.messages.push({ msg: 'Welcome, ' + nick, wolf: false, server: true, nick: undefined });
            console.log("ey listen!");
        }.bind(this));

        this.generalSocket.on('chat message', function(nick: string, msg: string) {
            self.state.messages.push({ msg: msg, wolf: false, server: false, nick: nick });
            console.log("ey listen!");
        }.bind(this));

        this.generalSocket.on('role assignation', function(r: string) {
            self.setState({
                role: r,
                wolf: r == 'Werewolf'
            });
            self.state.messages.push({ msg: 'Your role is now ' + r + '!', server: true, wolf: false, nick: undefined });

            if (r == "Werewolf" || r == "Game Master") {

                self.wolvesSocket = io('ws://' + window.location.host + '/wolves')
                
                self.wolvesSocket?.on('connect', () =>
                    self.wolvesSocket?.emit('join wolves', self.state.room));
                self.wolvesSocket?.on('wolf message', (nick: string, msg: string) => {
                    self.state.messages.push({ msg: msg, wolf: true, server: false, nick: nick })
                });
            }
        }.bind(this));

        this.generalSocket.on('game aborted', function() { 
            self.state.messages.push({ msg: 'Game aborted! Reload page.', server: true, wolf: false, nick: undefined });
        }.bind(this));

        this.generalSocket.on('no role available', function() {
            self.state.messages.push({ msg: 'No role available.', server: true, wolf: false, nick: undefined });
        }.bind(this));

        this.generalSocket.on('gamemaster', function() {
            self.state.messages.push({ msg: 'You have created the game!', server: true, wolf: false, nick: undefined });
        }.bind(this));

        this.generalSocket.on('nick changed', function(oldNick: string, newNick: string) {
            self.state.messages.push({ msg: oldNick + ' is now ' + newNick, server: true, wolf: false, nick: undefined });
        }.bind(this));

        // TODO Poll the server outside this function 
        //this.state.generalSocket.on('get identities', (msg) =>
        // TODO Call pollIdentities
        
        this.generalSocket.on('leaving', function(nick: string) {
            self.state.messages.push({ msg: nick + ' left.', server: true, wolf: false, nick: undefined });
        }.bind(this));

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
        this.roomListener();

        //this.getGeneralMessagesInterval = setInterval(() => this.roomListener(), 100);
    }

    setupBeforeUnloadListener = () => {
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            this.generalSocket?.emit('disconnection', this.state.room, this.state.nick);
        });
    };

            

    // TODO Add Dashboard, improve chat
    render() {
        return (       
            <main>
                <Container>
                    <Typography component="h1" variant="h5" gutterBottom >
                        {this.state.nick} @ { this.state.room }
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Typography component="h3" variant="h5" gutterBottom >
                                { this.state.role }
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper square>
                                <Typography variant="h5" gutterBottom>
                                Chat and server logs
                                </Typography>
                                <List>
                                {this.state.messages.map(({ msg, server, nick, wolf }) => (
                                    <React.Fragment>
                                    <ListItem button>
                                        <ListItemText color={server ? 'primary' : wolf ? 'error' : 'initial'} primary={nick ?? 'server'} secondary={msg}  />
                                    </ListItem>
                                    </React.Fragment>
                                ))}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>                   
                </Container>
            </main>
        )
    }
}