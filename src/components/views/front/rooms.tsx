import * as React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { RoomList } from "./RoomList";
import { FormRoom } from "./FormRoom";

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

export default function Rooms() {
    const classes = useStyles();

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="caption table">
                <caption>
                    <FormRoom />
                </caption>
                <TableHead>
                    <TableRow>
                        <TableCell>Room name</TableCell>
                        <TableCell align="right">Players</TableCell>
                    </TableRow>
                </TableHead>
                <RoomList />
            </Table>
        </TableContainer>
    );
}