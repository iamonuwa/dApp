import React, { Component, Fragment } from 'react';
import Form from './TradeComponents/Form';
import Table from './TradeComponents/Table';
import uniqueId from 'lodash/uniqueId';
import { MarketJS } from '../../util/marketjs/marketMiddleware';

import { Modal, Table as AntTable } from 'antd';

class Buy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: {
        qty: '',
        market: '',
        price: '',
        expirationTimestamp: '',
        type: ''
      },
      modal: false
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleOk = this.handleOk.bind(this);
  }

  onSubmit(values, market, type) {
    const { simExchange } = this.props;

    let order = {
      contractAddress: simExchange.contract.MARKET_COLLATERAL_POOL_ADDRESS,
      qty: values.qty,
      price: values.price,
      expirationTimestamp: values.expirationTimestamp,
      type: type
    };

    this.setState({
      order: order
    });
  }

  showModal() {
    this.setState({ modal: true });
  }

  handleCancel() {
    this.setState({ modal: false });
  }

  handleOk() {
    this.setState({ modal: false });

    MarketJS.createSignedOrderAsync(this.state.order).then(res => {
      console.log('createSignedOrderAsync', res);
    });
  }

  render() {
    const { order } = this.state;
    const columns = [
      {
        title: 'Amount',
        dataIndex: 'qty',
        key: 'qty'
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price'
      }
    ];

    return (
      <Fragment>
        <div className="tradeForm-container" style={{ marginBottom: '20px' }}>
          <Form
            {...this.props}
            onSubmit={this.onSubmit}
            showModal={this.showModal}
            order={order}
          />
        </div>

        <Table {...this.props} title={`${this.props.type}`} />

        {order && (
          <Modal
            title="Confirmation required"
            visible={this.state.modal}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <h3>
              Are you sure you want to{' '}
              {this.props.type === 'bids' ? 'buy' : 'sell'} {order.qty}{' '}
              {order.market} at {order.price}{' '}
              {this.props.simExchange.contract &&
                this.props.simExchange.contract.COLLATERAL_TOKEN_SYMBOL}{' '}
              for a total of {parseInt(order.qty, 10) * parseFloat(order.price)}?
            </h3>

            <AntTable
              rowKey={() => uniqueId('row')}
              pagination={false}
              size="small"
              columns={columns}
              dataSource={[order]}
            />
          </Modal>
        )}
      </Fragment>
    );
  }
}

export default Buy;
