import * as React from 'react';
import { Redirect } from 'react-router-dom';
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";

type FormRoomState = {
    room: string;
    redirect: boolean;
};

export class FormRoom extends React.Component<{}, FormRoomState> {
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            room: "myRoom",
            redirect: false
        };
    }
    handleInputChange(e: {
        target: {
            value: any;
        };
    }) {
        console.log(e.target.value);
        this.setState({ room: e.target.value });
    }
    handleOnClick = () => this.setState({ redirect: true });
    render() {
        if (this.state.redirect) {
            return <Redirect push to={"/village/#" + this.state.room} />;
        }
        return (
            <div>
                <TextField onChange={this.handleInputChange.bind(this)} id="room-name" label="Or enter a custom room" defaultValue={this.state.room} />
                <IconButton color="primary" aria-label="enter">
                    <SendIcon onClick={this.handleOnClick} />
                </IconButton>
            </div>
        );
    }
}
