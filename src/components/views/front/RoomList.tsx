import * as React from 'react';
import * as io from "socket.io-client";
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

type RoomListProps = {
    endpoint: string;
    rooms: Map<string, number>;
    rows: {
        name: string;
        players: number;
    }[];
};

function createData(name: string, players: number) {
    return { name, players };
}

export class RoomList extends React.Component<{}, RoomListProps> {
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            endpoint: window.location.host + '/general',
            rooms: new Map<string, number>(),
            rows: []
        };
    }
    getRooms() {
        const socket = io.connect(this.state.endpoint);
        console.log("Getting rooms...");
        socket.emit('get rooms');
        socket.on('get rooms', (r: {
            name: string;
            players: number;
        }[]) => {
            let rm = new Map();
            r.forEach((obj: {
                name: string;
                players: number;
            }) => rm.set(obj.name, obj.players));
            let rw: {
                name: string;
                players: number;
            }[] = [];
            rm.forEach((value, key) => rw.push(createData(key, value)));
            this.setState({
                rows: rw
            });
        });
    }



    componentDidMount = () => {
        console.log("Mounted");
        setInterval(() => this.getRooms(), 10000);
    };
    render() {

        return (
            <TableBody>
                {this.state.rows.map((row) => (
                    <TableRow key={row.name}>
                        <TableCell component="th" scope="row">
                            {row.name}
                        </TableCell>
                        <TableCell align="right">{row.players}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );
    }
}
