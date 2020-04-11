import * as React from 'react';
import { Redirect } from 'react-router-dom';
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import Grid from '@material-ui/core/Grid';

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
    handleInputChange(e: { target: { value: any; }; }) {
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
                <Grid container spacing={2}>
                    <Grid item xs={10} sm={9} md={9} lg={4}>
                        <TextField fullWidth variant="outlined"
                            onChange={this.handleInputChange.bind(this)} 
                            id="room-name" 
                            label="Room name must be all together"
                            defaultValue={this.state.room}
                        />
                    </Grid>
                    <Grid item xs={2} sm={1} md={1} lg={1}>
                        <IconButton color="primary" aria-label="enter">
                            <SendIcon onClick={this.handleOnClick} />
                        </IconButton>
                    </Grid>
                </Grid>
            </div>
        );
    }
}
