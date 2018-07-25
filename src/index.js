import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import WebFont from 'webfontloader';
import App from './App';
import Splash from './Splash';
import store, { history } from './store';
import getWeb3 from './util/web3/getWeb3';
import initializeMarket from './util/marketjs/initializeMarket';

// Display Splash until web3 is initialized
ReactDOM.render(
  <Splash alt="Initializing Web3..." />,
  document.getElementById('dapp')
);

// Initialize web3 and set in Redux
getWeb3(window)
  .then(results => {
    ReactDOM.render(
      <Provider store={store}>
        <App history={history} />
      </Provider>,
      document.getElementById('dapp')
    );
    // initializes a new market.js instance and stores it in the redux state.
    // depends on web3 having been properly initialized first.
    if (results.payload.web3Instance) {
      initializeMarket(results.payload);
    }
  })

  .catch(() => {
    console.log('Error in web3 initialization.');
  });

WebFont.load({
  google: {
    families: ['Work Sans:300,400,500,600,700', 'sans-serif']
  }
});
