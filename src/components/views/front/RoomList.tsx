import * as React from 'react';
import * as io from "socket.io-client";
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { Redirect, Link } from 'react-router-dom';

type RoomListState = {
    endpoint: string;
    rooms: Map<string, number>;
    rows: {
        name: string;
        players: number;
    }[];
    redirect: boolean;
    roomToGo: string;
};

function createData(name: string, players: number) {
    return { name, players };
}

export class RoomList extends React.Component<{}, RoomListState> {
    getRoomInterval: NodeJS.Timeout | undefined;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            endpoint: window.location.host + '/general',
            rooms: new Map<string, number>(),
            rows: [],
            redirect: false,
            roomToGo: 'Default'
        };
        this.getRoomInterval = undefined;
    }
    
    getRooms() {
        const socket = io.connect(this.state.endpoint);
        console.log("Getting rooms...");
        socket.emit('get rooms');
        socket.on('get rooms', (r: { name: string; players: number; }[]) => {
            let rm = new Map();
            r.forEach((obj: { name: string; players: number; }) =>
                rm.set(obj.name, obj.players)
            );
            let rw: { name: string; players: number; }[] = [];
            rm.forEach((value, key) => rw.push(createData(key, value)));
            this.setState({
                rows: rw
            });
        });
    }

    goToRoom = (name: string) => this.setState({ roomToGo: name });

    componentDidMount = () => {
        console.log("Mounted");
        this.getRoomInterval = setInterval(() => this.getRooms(), 1000);
    };

    componentWillUnmount = () => {
        if (this.getRoomInterval) clearInterval(this.getRoomInterval);
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push to={"/village/" + this.state.roomToGo} />;
        }

        return (
            <div>
                <ListSubheader inset>Current rooms</ListSubheader>
                {this.state.rows.map((row) => (
                    <Link to={"/village/" + row.name} >
                    <ListItem button>
                        <ListItemIcon>
                            <PlayArrowIcon />
                        </ListItemIcon>
                        <ListItemText primary={row.name + " (" + row.players + ")"} />
                    </ListItem>
                    </Link>
                ))}
            </div>
        );
    }
}
