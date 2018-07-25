import React, { Component, Fragment } from 'react';
import InputDataDecoder from 'ethereum-input-data-decoder';
import { abi } from '@marketprotocol/marketprotocol/build/contracts/MarketCollateralPool';

import { Table, Row } from 'antd';

import columns from './Columns';
import _ from 'lodash';

class BuyTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: 1,
      transactions: []
    };

    this.decoder = new InputDataDecoder(abi);
  }

  componentDidUpdate(prevProps) {
    const { simExchange, web3 } = prevProps;

    if (
      simExchange.contract &&
      this.props.simExchange.contract !== simExchange.contract
    ) {
      let filter = web3.web3Instance.eth.filter({
        fromBlock: '0x0',
        toBlock: 'latest',
        address: simExchange.contract.MARKET_COLLATERAL_POOL_ADDRESS
      });

      this.setState({
        transactions: []
      });

      filter.get((error, transactions) => {
        let fetchedTransactions = [];

        transactions.forEach(transaction => {
          web3.web3Instance.eth.getTransaction(
            transaction.transactionHash,
            (error, response) => {
              const transactionInput = this.decoder.decodeData(response.input);

              if (
                response.from === web3.web3Instance.eth.coinbase ||
                response.to === web3.web3Instance.eth.coinbase
              ) {
                let payload = {
                  key: response.blockHash,
                  block: response.blockNumber,
                  inout:
                    transactionInput.name === 'depositTokensForTrading'
                      ? 'in'
                      : 'out',
                  type:
                    transactionInput.name === 'depositTokensForTrading'
                      ? 'deposit'
                      : 'withdraw',
                  addresses: {
                    from:
                      transactionInput.name === 'depositTokensForTrading'
                        ? response.from
                        : response.to,
                    to:
                      transactionInput.name === 'depositTokensForTrading'
                        ? response.to
                        : response.from
                  },
                  amount: `${web3.web3Instance
                    .fromWei(transactionInput.inputs[0], 'ether')
                    .toString()} ${
                    simExchange.contract.COLLATERAL_TOKEN_SYMBOL
                  }`,
                  details: {
                    hash: response.blockHash
                  }
                };

                fetchedTransactions.push(payload);

                this.setState({
                  transactions: _.uniq(fetchedTransactions)
                });
              }
            }
          );
        });
      });
    }
  }

  render() {
    return (
      <Fragment>
        <Row gutter={24}>
          <h1 className="table-header-title">Transfer</h1>
          <Table dataSource={this.state.transactions} columns={columns} />
        </Row>
      </Fragment>
    );
  }
}

export default BuyTable;
