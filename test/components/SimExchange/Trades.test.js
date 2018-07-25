import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import moment from 'moment';

import Trades from '../../../src/components/SimExchange/Trades';
import TradeContainer from '../../../src/components/SimExchange/TradeContainer';
import { MarketJS } from '../../../src/util/marketjs/marketMiddleware';
import Table from '../../../src/components/SimExchange/TradeComponents/Table';
import BigNumber from 'bignumber.js';

const mockContract = {
  contract: { key: '0x6467854f25ff1f1ff8c11a717faf03e409b53635' },
  CONTRACT_NAME: 'ETHXBT',
  COLLATERAL_TOKEN: 'FakeDollars',
  COLLATERAL_TOKEN_ADDRESS: '0x6467854f25ff1f1ff8c11a717faf03e409b53635',
  COLLATERAL_TOKEN_SYMBOL: 'FUSD',
  MARKET_COLLATERAL_POOL_ADDRESS: new BigNumber(),
  PRICE_FLOOR: '60465',
  PRICE_CAP: '20155',
  PRICE_DECIMAL_PLACES: '2',
  QTY_MULTIPLIER: '10',
  ORACLE_QUERY:
    'json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0',
  EXPIRATION: '',
  lastPrice: '105700',
  isSettled: true,
  collateralPoolBalance: ''
};

describe('Trades', () => {
  let props;
  let state;
  let tradesContainer;

  beforeEach(() => {
    props = {
      buys: [],
      sells: [],
      simExchange: {
        contract: {}
      }
    };

    state = {
      buys: [],
      sells: []
    };

    tradesContainer = shallow(<Trades {...props} />);
  });

  it('should getUnallocatedCollateral', async () => {
    let spy = sinon.spy(tradesContainer.instance(), 'getUnallocatedCollateral');
    sinon
      .stub(MarketJS, 'getUserAccountBalanceAsync')
      .resolves(
        tradesContainer.setState({ unallocatedCollateral: 100000000000000000 })
      );

    tradesContainer.update();

    tradesContainer.instance().getUnallocatedCollateral(props);

    expect(spy.called).to.equal(true);
    expect(tradesContainer.state('unallocatedCollateral')).to.equal(
      100000000000000000
    );
  });
});

describe('TradesContainer', () => {
  let props;
  let tradeContainer;
  let trades;
  let mountTradeContainer;
  let state;

  beforeEach(() => {
    props = {
      asks: [],
      bids: [],
      simExchange: {
        contract: {
          MARKET_COLLATERAL_POOL_ADDRESS: new BigNumber()
        }
      }
    };

    tradeContainer = shallow(
      <TradeContainer {...props} type="bids" market="" data={props.bids} />,
      { context: { state: state } }
    );

    trades = shallow(<Trades {...props} />);
  });

  it('shows order on row select', () => {
    let tableContainer = shallow(<Table {...props} />);

    tradeContainer.update();
    tableContainer.update();
  });

  it('should open trade confirmation modal', () => {
    let spy = sinon.spy(tradeContainer.instance(), 'showModal');
    tradeContainer.update();

    tradeContainer.instance().showModal();

    expect(tradeContainer.state('modal')).to.equal(true);
    expect(spy.called).to.equal(true);
  });

  it('should close trade confirmation modal', () => {
    let spy = sinon.spy(tradeContainer.instance(), 'handleCancel');
    tradeContainer.update();

    tradeContainer.instance().handleCancel();

    expect(tradeContainer.state('modal')).to.equal(false);
    expect(spy.called).to.equal(true);
  });

  it('should handleOk', async () => {
    let spy = sinon.spy(tradeContainer.instance(), 'handleOk');
    sinon.stub(MarketJS, 'createSignedOrderAsync').resolves({
      v: 27,
      r: '0xaefb074ad9ca7bd1546ac53a8fe7f8bb3aefca14b573f4955a8b38b692e68f01',
      s: '0x3a1cb01e410407076e4d7dde6f17971a0901fdcaa50bfcc0e615de0fffa31f12'
    });

    tradeContainer.update();

    tradeContainer.instance().handleOk();

    expect(tradeContainer.state('modal')).to.equal(false);
    expect(spy.called).to.equal(true);
  });

  it('should submit form and open confirmation modal', () => {
    let spy = sinon.spy(tradeContainer.instance(), 'onSubmit');

    tradeContainer
      .instance()
      .onSubmit(
        { qty: 1, price: 1, expirationTimestamp: moment().unix() },
        '',
        'bids'
      );
    expect(spy.called).to.equal(true);
  });

  it('should getOrders from market api', () => {
    let fetchStub = sinon.stub(window, 'fetch');
    let spy = sinon.spy(trades.instance(), 'getOrders');

    let body = {
      contract: {
        name: 'BIT_OMGUSD_USDT_1531938985085',
        address: '0x46e1c3951a2a2eef584a2136cbdf06161e6e5f99',
        price: '698970',
        priceDecimalPlaces: '5',
        priceTimestamp: 1532365909109
      },
      buys: [
        {
          contractAddress: '0x46e1c3951a2a2eef584a2136cbdf06161e6e5f99',
          expirationTimestamp: '1532369508',
          feeRecipient: '0x0000000000000000000000000000000000000000',
          maker: '0x361ffaa1c30267ffb4c74c87fd50751b038d20b4',
          makerFee: '0',
          orderQty: '1',
          price: '702045',
          remainingQty: '1',
          salt:
            '5.32226797211280170343922640645038959045732426814250374849070140144286219789637e+76',
          taker: '0x0000000000000000000000000000000000000000',
          takerFee: '0',
          ecSignature: {
            v: '0x1b',
            r:
              '0x9fcc4c2df2ff2af2e812330ce35698890b21f799eed0b035275abb7b69bcd534',
            s:
              '0x075d7fdbe0e2b1814993b67f43499f0c22293fc2a84349377bd1bd77f0b55136'
          }
        },
        {
          contractAddress: '0x46e1c3951a2a2eef584a2136cbdf06161e6e5f99',
          expirationTimestamp: '1532369508',
          feeRecipient: '0x0000000000000000000000000000000000000000',
          maker: '0x361ffaa1c30267ffb4c74c87fd50751b038d20b4',
          makerFee: '0',
          orderQty: '1',
          price: '702675',
          remainingQty: '1',
          salt:
            '4.57283481906925122336007710256343417468824516693689586005598460783289838937629e+76',
          taker: '0x0000000000000000000000000000000000000000',
          takerFee: '0',
          ecSignature: {
            v: '0x1b',
            r:
              '0x93dc2c1c434abc060ed3f8069fd8e893095ff2e60db72a1c0279d860a9289d68',
            s:
              '0x125403d8c6f77b793cfaa87621e21161e2bd417b68a6810fede21e9aec586fb2'
          }
        }
      ],
      sells: [
        {
          contractAddress: '0x46e1c3951a2a2eef584a2136cbdf06161e6e5f99',
          expirationTimestamp: '1532369508',
          feeRecipient: '0x0000000000000000000000000000000000000000',
          maker: '0x361ffaa1c30267ffb4c74c87fd50751b038d20b4',
          makerFee: '0',
          orderQty: '-1',
          price: '693500',
          remainingQty: '1',
          salt:
            '9.68613323383461803244848896843308929246354481741034086363465017514840230918937e+76',
          taker: '0x0000000000000000000000000000000000000000',
          takerFee: '0',
          ecSignature: {
            v: '0x1c',
            r:
              '0x079b0da71c6cda366f037e151890daf60d3e2456752a991f7cb33081df36d9c3',
            s:
              '0x2939dce51af8cce4e2c6aee7930b0def900cd238c3b1e3c027c55c416aadfcca'
          }
        },
        {
          contractAddress: '0x46e1c3951a2a2eef584a2136cbdf06161e6e5f99',
          expirationTimestamp: '1532369508',
          feeRecipient: '0x0000000000000000000000000000000000000000',
          maker: '0x361ffaa1c30267ffb4c74c87fd50751b038d20b4',
          makerFee: '0',
          orderQty: '-1',
          price: '693825',
          remainingQty: '1',
          salt:
            '1.5339000473208059890074052649635697341836183179041761463453844318645637395494e+75',
          taker: '0x0000000000000000000000000000000000000000',
          takerFee: '0',
          ecSignature: {
            v: '0x1c',
            r:
              '0x99e10fb3cd5fe83003e6ffdd4cce6c7a37bd48f2d235092f08f8bad73706bcde',
            s:
              '0x2c73a7f924fce6efc52e3c0e4890ebaddf8725f61db9399b47df362ecfd99b34'
          }
        }
      ]
    };

    let response = {
      json: () => {
        return body;
      }
    };
    fetchStub.returns(Promise.resolve(response));
    trades.setProps({
      simExchange: mockContract
    });
    trades.instance().getOrders('0x46e1c3951a2a2eef584a2136cbdf06161e6e5f99');

    expect(spy.called).to.equal(true);
  });
});
