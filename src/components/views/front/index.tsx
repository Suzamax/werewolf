import * as React from "react";
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Rooms from "./rooms";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      margin: 'auto',
      maxWidth: 500,
    },
    image: {
      width: 128,
      height: 128,
    },
    img: {
      margin: 'auto',
      display: 'block',
      maxWidth: '100%',
      maxHeight: '100%',
    },
  }),
);



export default function FrontPage() {

    const classes = useStyles();

    return (       
        <main className={classes.root}>
            <Container >

                <Typography variant="h3" component="h1">Werewolf</Typography>
                <Typography variant="h4" component="h2" gutterBottom>Town Sleeps... Online</Typography>

                <Typography variant="h5" component="h3">Newest rooms</Typography>
                <Rooms />

            </Container>
            
        </main>
    ) /*
                <Container>
                    <h3>Newest rooms:</h3>

                    <h3>Or enter to a new room:</h3>
                    <Field hasAddons hasAddonsCentered>
                        <Input />
                        <Button type="submit" isInfo value="Enter room" />
                    </Field>
                </Container>
                </Column>
                <Column></Column>
                </Columns>
            </Section>
        </main> */
}