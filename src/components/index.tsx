import * as React from "react";
import ReactDOM = require("react-dom");
import {
  BrowserRouter as Router,
  Switch,
  Route
  // Something more?
} from 'react-router-dom';
import FrontPage from './views/front';
import Village from './views/village';

export class App extends React.Component {

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/village">
            <Village />
          </Route>
          <Route path="/">
            <FrontPage />
          </Route>
        </Switch>
      </Router>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById("react")
);