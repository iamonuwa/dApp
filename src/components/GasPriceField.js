import { Col, Form, Icon, InputNumber, Row, Popover } from 'antd';
import React, { Component } from 'react';
import Rx from 'rxjs/Rx';

import { isTestnetOrMainnet } from '../util/utils';

const FormItem = Form.Item;

class GasPriceField extends Component {
  constructor(props) {
    super(props);

    /*let gasLimitEstimate = 21000;

    if (
      this.props.location &&
      this.props.location.pathname.indexOf('/test') !== -1
    ) {
      gasLimitEstimate = 200000;
    }

    if (
      this.props.location &&
      this.props.location.pathname.indexOf('/contract/deploy') !== -1
    ) {
      gasLimitEstimate = 5700000;
    }*/

    this.state = {
      gaslimit: props.gaslimit,
      gasprice: 2,
      condition: null,
      message: this.getMessage(null, props.gaslimit, 2)
    };

    this.updateNetworkCondition = this.updateNetworkCondition.bind(this);
  }

  onGasLimitChange(value) {
    if (!value || isNaN(value)) return;

    this.setState({
      gaslimit: value,
      message: this.getMessage(this.state.condition, value, this.state.gasprice)
    });

    if (this.props.onUpdateGasLimit) {
      this.props.onUpdateGasLimit(value);
    }
  }

  onGasPriceChange(value) {
    if (!value || isNaN(value)) return;

    this.setState({
      gasprice: value,
      message: this.getMessage(this.state.condition, this.state.gaslimit, value)
    });

    if (this.props.onUpdateGasPrice) {
      this.props.onUpdateGasPrice(value);
    }
  }

  updateNetworkCondition(data) {
    this.setState({
      condition: data,
      message: this.getMessage(data, this.state.gaslimit, this.state.gasprice)
    });
  }

  getTime(condition, price) {
    let time = -1;

    if (!condition) return time;

    if (price * 10 >= condition.fastest) {
      time = condition.fastestWait;
    } else if (price * 10 >= condition.fast) {
      time = condition.fastWait;
    } else if (price * 10 >= condition.average) {
      time = condition.avgWait;
    } else if (price * 10 >= condition.safeLow) {
      time = condition.safeLowWait;
    }

    return time;
  }

  getMessage(condition, gasLimit, gasPrice) {
    const time = this.getTime(condition, gasPrice);
    const cost = gasLimit * gasPrice / 1000000000;
    const message = !condition
      ? `The following MetaMask settings will cost ${cost} ETH, the confirmation time depends on the overall network traffic`
      : time >= 0
        ? `The following MetaMask settings should give a ${time} min confirmation for ${cost} ETH`
        : `The gas price is below the market low safe price (currently about ${condition.safeLow /
            10} gwei), your transaction might take forever to get confirmed`;
    return message;
  }

  componentDidMount() {
    const gasInfoUrl = 'https://ethgasstation.info/json/ethgasAPI.json';

    this.subscription = Rx.Observable.ajax({
      url: gasInfoUrl,
      method: 'GET',
      responseType: 'json',
      crossDomain: true
    })
      .map(data => data.response)
      .subscribe(this.updateNetworkCondition);
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const isMetamask = isTestnetOrMainnet(this.props.network);

    return (
      <Row>
        <Col>
          {!this.props.isSimplified && <h2>Gas Setting</h2>}
          <div>{this.state.message}</div>
          <br />
          <Row gutter={16}>
            <Col lg={12} xs={24}>
              <FormItem
                label={
                  <span>
                    Gas Limit (units){' '}
                    <Popover
                      content="Gas limit is how many cycles (think opcodes) your transaction will take"
                      title="More about `Gas Limit`"
                      trigger="click"
                    >
                      <Icon
                        type="question-circle-o"
                        style={{ cursor: 'pointer' }}
                      />
                    </Popover>
                  </span>
                }
              >
                {this.props.form ? (
                  this.props.form.getFieldDecorator('gas', {
                    initialValue: this.state.gaslimit
                  })(
                    <InputNumber
                      min={0}
                      placeholder="Gas Limit (units)"
                      onChange={this.onGasLimitChange.bind(this)}
                      style={{ width: '100%' }}
                      disabled={isMetamask}
                    />
                  )
                ) : (
                  <InputNumber
                    min={0}
                    placeholder="Gas Limit (units)"
                    onChange={this.onGasLimitChange.bind(this)}
                    style={{ width: '100%' }}
                    value={this.state.gaslimit}
                    disabled={isMetamask}
                  />
                )}
              </FormItem>
            </Col>
            <Col lg={12} xs={24}>
              <FormItem
                label={
                  <span>
                    Gas Price (gwei){' '}
                    <Popover
                      content="Gas price is how much ETH you’re willing to pay per cycle"
                      title="More about `Gas Price`"
                      trigger="click"
                    >
                      <Icon
                        type="question-circle-o"
                        style={{ cursor: 'pointer' }}
                      />
                    </Popover>
                  </span>
                }
              >
                {this.props.form ? (
                  this.props.form.getFieldDecorator('gasPrice', {
                    initialValue: this.state.gasprice
                  })(
                    <InputNumber
                      min={0}
                      onChange={this.onGasPriceChange.bind(this)}
                      placeholder="Gas Price (gwei)"
                      style={{ width: '100%' }}
                    />
                  )
                ) : (
                  <InputNumber
                    min={0}
                    onChange={this.onGasPriceChange.bind(this)}
                    placeholder="Gas Price (gwei)"
                    value={this.state.gasprice}
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <div>
            <strong>Help:</strong>
            <ul>
              <li>
                <a
                  href="https://www.cryptocompare.com/coins/guides/what-is-the-gas-in-ethereum/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Why do I need metamask / gas?
                </a>
              </li>
              <li>
                <a
                  href="https://etherscan.io/gastracker"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  What gas price should I use?
                </a>
              </li>
              <li>
                <a
                  href="https://ethgasstation.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  What are current network conditions?
                </a>
              </li>
            </ul>
          </div>
          <br />
        </Col>
      </Row>
    );
  }
}

export default GasPriceField;
