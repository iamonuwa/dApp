import React, { Component } from 'react';
import { Card, Row, Modal, Col } from 'antd';
import { MarketJS } from '../../../util/marketjs/marketMiddleware';

import { getTokenBalance } from '../../../util/utils';

import Form from './Form';

class HeaderMenu extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.getBalances = this.getBalances.bind(this);

    this.state = {
      amount: {},
      transaction: {},
      unallocatedCollateral: 0,
      availableCollateral: 0
    };
  }

  componentDidCatch(error, info) {
    console.log(error);
    console.log(info);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.simExchange.contract !== this.props.simExchange.contract &&
      prevProps.simExchange.contract !== null
    ) {
      this.getBalances(prevProps);
    }
  }
  componentDidMount() {
    this.props.simExchange.contract && this.getBalances(this.props);
  }

  onSubmit(amount) {
    this.setState({ amount });
  }

  showModal() {
    this.setState({ modal: true });
  }

  handleCancel() {
    this.setState({ modal: false });
  }

  handleOk() {
    this.setState({ modal: false });
    const { amount } = this.state;

    switch (amount.type) {
      case 'deposit':
        MarketJS.depositCollateralAsync(amount);
        break;
      case 'withdraw':
        MarketJS.withdrawCollateralAsync(amount);
        break;
      default:
        break;
    }
  }

  async getBalances(props) {
    const { simExchange } = props;

    await MarketJS.getUserAccountBalanceAsync(simExchange.contract, true).then(
      balance => {
        this.setState({
          unallocatedCollateral: balance
        });
      }
    );

    getTokenBalance(
      simExchange.contract.COLLATERAL_TOKEN_ADDRESS,
      true,
      availableCollateral => {
        this.setState({
          availableCollateral: availableCollateral
        });
      }
    );
  }

  render() {
    const { amount } = this.state;
    const { simExchange } = this.props;
    const contract = simExchange.contract;

    return (
      <Row gutter={24} className="header-menu">
        <Col span={12}>
          <Card
            title="Deposit Collateral"
            extra={
              contract && (
                <span>
                  Available:{' '}
                  {`${this.state.availableCollateral}
                  ${contract.COLLATERAL_TOKEN_SYMBOL}`}
                </span>
              )
            }
          >
            <Form
              collateralToken={contract && contract.COLLATERAL_TOKEN_SYMBOL}
              onSubmit={this.onSubmit}
              showModal={this.showModal}
              type="deposit"
              amount={amount}
              className="deposit-form"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="Withdraw Collateral"
            extra={
              contract && (
                <span>
                  Available:{' '}
                  {`${this.state.unallocatedCollateral}
                  ${contract.COLLATERAL_TOKEN_SYMBOL}`}
                </span>
              )
            }
          >
            <Form
              collateralToken={contract && contract.COLLATERAL_TOKEN_SYMBOL}
              onSubmit={this.onSubmit}
              showModal={this.showModal}
              type="withdraw"
              amount={amount}
              className="withdraw-form"
            />
          </Card>
        </Col>
        <Modal
          title="Confirmation required"
          visible={this.state.modal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className="collateral-modal"
        >
          <h3>
            Are you sure you want to {amount && amount.type}{' '}
            {amount && amount.number}{' '}
            {contract && contract.COLLATERAL_TOKEN_SYMBOL}?
          </h3>
        </Modal>
      </Row>
    );
  }
}

export default HeaderMenu;
