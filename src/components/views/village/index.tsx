import * as React from "react";
import * as io from 'socket.io-client';
import Container from '@material-ui/core/Container';
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SendIcon from '@material-ui/icons/Send';
import DirectionsIcon from '@material-ui/icons/Directions';
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";

type message = {
    id: number,
    msg: string,
    server: boolean,
    nick: string | undefined,
    wolf: boolean
}

type VillageState = {
    //socket: SocketIOClient.Socket,
    //wolvesSocket: SocketIOClient.Socket | undefined,
    role: string,
    nick: string,
    room: string,
    wolf: boolean,
    joinedRoom: boolean,
    connected: boolean,
    messages: message[],
    msg: string,
    msgcounter: number
}

export default class Village extends React.Component<{}, VillageState> {


    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            //socket: io.connect(window.location.host + '/general'),
            //wolvesSocket: undefined,
            room: window.location.hash,
            nick: "villager" + new Date().getTime().toString(),
            role: 'Viewer',
            wolf: false,
            joinedRoom: false,
            connected: false,
            messages: [],
            msg: '',
            msgcounter: 0
        };       
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
    }

    updateMessagesStateHandler(msg: message) {
        this.setState({
            messages: [...this.state.messages, msg],
            msgcounter: this.state.msgcounter + 1
        });
    }

    onChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        // parent class change handler is always called with field name and value
        this.setState({ msg: e.target.value});
        console.log(this.state.msg);
    }

    onSubmitMessage = (socket: SocketIOClient.Socket) => (e: React.FormEvent) => {
        e.preventDefault();
        socket.emit('chat message', this.state.room, this.state.nick, this.state.msg);
        this.setState({msg: ''})
    }
   
    // TODO Add Dashboard, improve chat
    render() {
        
        const { room, nick } = this.state;

        const socket = io.connect(window.location.host + '/general');
        let wolves: SocketIOClient.Socket | undefined = undefined;

        console.log('connecting...');

        if (!this.state.joinedRoom) {
            socket.emit('join room', room, nick);
        }

        if (!this.state.connected)
        socket.on('connect', () => { 
            console.log('connected!');
            socket.emit('new connection', nick, room);
            this.setState({
                joinedRoom: true,
                connected: true
            });
        });

        socket.on('welcome message', (nick: string) => {
            this.updateMessagesStateHandler({id: this.state.msgcounter + 1, msg: 'Welcome, ' + nick, wolf: false, server: true, nick: undefined })
            console.log("ey listen!");
        });

        socket.on('chat message', (nick: string, msg: string) => {
            this.updateMessagesStateHandler({ id: this.state.msgcounter + 1, msg: msg, wolf: false, server: false, nick: nick });
            console.log("ey listen!");
        });

        socket.on('role assignation', (r: string) => {
            this.setState({
                role: r,
                wolf: r == 'Werewolf'
            });
            this.updateMessagesStateHandler({ id: this.state.msgcounter + 1, msg: 'Your role is now ' + r + '!', server: true, wolf: false, nick: undefined });

            if (r == "Werewolf" || r == "Game Master") {

                wolves = io('ws://' + window.location.host + '/wolves')
                
                wolves.on('connect', () =>
                    wolves?.emit('join wolves', this.state.room));
                wolves.on('wolf message', (nick: string, msg: string) => {
                    this.updateMessagesStateHandler({id: this.state.msgcounter + 1, msg: msg, wolf: true, server: false, nick: nick })
                });
            }
        });

        /*
        socket.on('game aborted', function() { 
            self.state.messages.push({ msg: 'Game aborted! Reload page.', server: true, wolf: false, nick: undefined });
        });

        socket.on('no role available', function() {
            self.state.messages.push({ msg: 'No role available.', server: true, wolf: false, nick: undefined });
        });

        socket.on('gamemaster', function() {
            self.state.messages.push({ msg: 'You have created the game!', server: true, wolf: false, nick: undefined });
        });

        socket.on('nick changed', function(oldNick: string, newNick: string) {
            self.state.messages.push({ msg: oldNick + ' is now ' + newNick, server: true, wolf: false, nick: undefined });
        });

        // TODO Poll the server outside this function 
        //this.state.generalsocket.on('get identities', (msg) =>
        // TODO Call pollIdentities
        
        socket.on('leaving', function(nick: string) {
            self.state.messages.push({ msg: nick + ' left.', server: true, wolf: false, nick: undefined });
        });




        */


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
                            <Paper>
                                <Typography variant="h5" gutterBottom>
                                Chat and server logs
                                </Typography>
                                <List>
                                {this.state.messages.map(({ id, msg, server, nick, wolf }) => (
                                    <React.Fragment key={id}>
                                    <ListItem button>
                                        <ListItemText color={server ? 'primary' : wolf ? 'error' : 'initial'} primary={nick ?? 'server'} secondary={msg}  />
                                    </ListItem>
                                    </React.Fragment>
                                ))}
                                </List>
                                <Paper component="form" >
                                    <IconButton aria-label="menu">
                                        <MenuIcon />
                                    </IconButton>
                                    <InputBase
                                        onChange={this.onChangeMessage}
                                        style={{
                                            flex: 2,
                                        }}
                                        placeholder="Send a message"
                                        inputProps={{ 'aria-label': 'send a message' }}
                                        value={this.state.msg}
                                    />
                                    <IconButton type="submit" onClick={this.onSubmitMessage(socket)} aria-label="search">
                                        <SendIcon />
                                    </IconButton>
                                </Paper>
                            </Paper>
                        </Grid>
                    </Grid>                   
                </Container>
            </main>
        )
    }
}
