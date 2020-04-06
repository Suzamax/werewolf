import * as React from "react";
import * as io from 'socket.io-client';
import Container from '@material-ui/core/Container';

type VillageState = {
    role: string,
    nick: string,
    room: string,
    wolves: SocketIOClient.Socket
}

type VillageProps = {
    general: SocketIOClient.Socket,
}

export default class Village extends React.Component<VillageProps, VillageState> {
    
    
    static defaultProps = {
        general: io.connect(window.location.host + '/general')
    }

    componentWillMount() {
        this.setState({
            room: window.location.hash.toString(),
            nick: "villager" + new Date().getTime().toString(),
            role: 'Player'
        })
    }

    // TODO Add Dashboard and chat
    render() {
        return (       
            <main>
                <Container>
                    <h1>{ this.state.room }</h1>
                    <h2>{this.state.nick} is { this.state.role }</h2>

                        
                </Container>
            </main>
        )
    }
}