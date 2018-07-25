import { Layout } from 'antd';
import React, { Component } from 'react';
import { Route, Router } from 'react-router';

import Header from './components/Header';
import MarketFooter from './components/MarketFooter';

import { routes } from './routes';

import './less/App.less';

const { Content } = Layout;

class App extends Component {
  componentDidMount() {
    if (localStorage) {
      localStorage.setItem('showWelcomeMessage', true);
    }
  }

  render() {
    return (
      <Router history={this.props.history}>
        <Layout style={{ minHeight: '100vh' }}>
          <Header />
          <Content>
            {routes.map(route => <Route key={route.path} {...route} />)}
          </Content>

          <MarketFooter />
        </Layout>
      </Router>
    );
  }
}

export default App;
