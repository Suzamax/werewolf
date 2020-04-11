import "reflect-metadata"; // this shim is required
import {createExpressServer} from "routing-controllers";
import { VillageController } from "./controllers/VillageController";
import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as mustacheExpress from 'mustache-express';
import * as socketio from 'socket.io';
import { Socket } from "socket.io";
import { Room } from './classes/room';

const PORT = process.env.PORT || 3000;
const app = createExpressServer({
    controllers: [
        VillageController
    ]
});

// This stores a map where string is the name of the room.
let rooms: Map<string, Room> = new Map();

app
    .use(express.static(path.join(__dirname,'/public')))
    // Deprecating ASAP in favor of React
    .engine('mustache', mustacheExpress())
    .set('views', __dirname + '/views')
    .set('view engine', 'mustache')
;

// initialize a simple http server
const httpsrv = http.createServer(app);
const io = socketio(httpsrv);

// General socket
const general = io
    .of("/general")
    .on('connection', (socket: Socket) => {
        //console.log("An user connected!");

        setTimeout(() => socket.disconnect(true), 5000);

        socket.on('new connection', (nick: string, room: string) => {
            console.log(nick + " joined " + room);
        });

        socket.on('get rooms', () => {
            let obj: {name: string, players: number}[] = [];
            rooms.forEach((value, key) => {
                if (value.getProgress())
                    obj.push({
                        name: key,
                        players: value.howManyMembers()
                    });
            });
            socket.emit('get rooms', obj);
        });

        /**
         * Joins a room. If there's not a room with that name, it will create and store a Room object on rooms Map.
         */
        socket.on('join room', (room, nick) => {
            socket.join(room);
            rooms.get(room)?.setMemberNick(socket.id, nick);
            if (!rooms.has(room)) {
                rooms.set(room, new Room());
                rooms.get(room)?.setMemberNick(socket.id, nick);
                rooms.get(room)?.setGameMaster(socket.id);
                socket.to(room).emit('role assignation', "Game Master");
            }
            socket.to(room).emit('welcome message', nick);
            console.log('welcome,' + nick);
        });

        /**
         * Gets a chat message from whatever room and broadcasts it on the same room.
         */
        socket.on('chat message', (room: string, nick:string, msg: string) => {
            general.to(room).emit('chat message', nick, msg);}
            //console.log("("+room+") " + nick + ": " + msg);}
        );

        /**
         * This action is only executed by the game master
         */
        socket.on('init game', (room, w, v, r) => {
            if (rooms.get(room)?.getMemberRole(socket.id) == "Game Master" && !rooms.get(room)?.getProgress()) {
                rooms.get(room)?.initRoom(w,v,r);
                socket.to(room).emit('init game');
            } else socket.to(room).emit('no privileges');
        });
        
        socket.on('abort game', (room) => {
            if (rooms.get(room)?.getMemberRole(socket.id) == "Game Master" && rooms.get(room)?.getProgress()) {
                rooms.get(room)?.abortGame();
                general.to(room).emit('game aborted');
            } else socket.to(room).emit('no privileges');
        });

        socket.on('change nick', (room, oldNick: string, newNick: string) => {
           //console.log('%s is now %s', oldNick, newNick);
           rooms.get(room)?.setMemberNick(socket.id, newNick);
           general.to(room).emit('nick changed', oldNick, newNick);
        });

        socket.on('request role', (room: string, nick: string) => {
            // console.log('%s requests a role!', nick);
            rooms.get(room)?.setMemberRole(socket.id);
            // console.log("Assigning role %s to %s", r, nick);
            socket.to(room).emit('role assignation', rooms.get(room)?.getMemberRole(socket.id));
        });

        socket.on('get identities', (room) =>
            socket.to(room).emit('get identities', rooms.get(room)?.getMembers()));

        // send immediatly a feedback to the incoming connection
        socket.send('Hi there, I am a WebSocket server');
    })
;

// Werewolves socket
const wolves = io
    .of("/wolves")
    .on('connection', (socket: Socket) => {
        socket.on('join wolves', room => socket.join(room));
        //console.log("WOOF! WOOF!");

        socket.on('wolf message', (room: string, nick:string, msg: string) => // {
            // log the received message and send it back to the client
            //console.log("("+room+") " + nick + ": " + msg);
            wolves.to(room).emit('wolf message', nick, msg));
        //});
    })
;

// Init the server
httpsrv.listen(PORT, () => console.log(`Listening on ${PORT}`));