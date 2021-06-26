import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import ReactNotification from 'react-notifications-component';

import Home from './Pages/Home';
import Header from './Components/Header';
import 'react-notifications-component/dist/theme.css';
import 'animate.css/animate.min.css';

import './common/style.css';

export default function App() {
  return (
    <Router>
      <>
        <ReactNotification />
        <Header />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
        </Switch>

      </>
    </Router>
  );
}
