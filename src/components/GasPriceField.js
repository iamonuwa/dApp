import {
  Col,
  Form,
  Icon,
  InputNumber,
  Row,
  Popover,
  Slider,
  Collapse
} from 'antd';
import React, { Component } from 'react';
import Rx from 'rxjs/Rx';

import { isTestnetOrMainnet } from '../util/utils';

const FormItem = Form.Item;
const Panel = Collapse.Panel;

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

    this.props.form.setFieldsValue({
      gasPrice: value
    });
  }

  updateNetworkCondition(data) {
    const recommendedGasPrice = data.average / 10;
    this.setState({
      condition: data,
      gasprice: recommendedGasPrice,
      message: this.getMessage(data, this.state.gaslimit, recommendedGasPrice)
    });
  }

  getMinValueForGasPrice() {
    return this.state.condition ? (this.state.condition.safeLow - 10) / 10 : 1;
  }

  getMaxValueForGasPrice() {
    return this.state.condition ? this.state.condition.fast / 10 : 10;
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
    const cost = (gasLimit * gasPrice / 1000000000).toFixed(5);
    const message = !condition ? (
      <div>
        The transaction will cost <strong>{cost} ETH</strong>, the confirmation
        time depends on the overall network traffic
      </div>
    ) : time >= 0 ? (
      <div>
        The transaction will take around{' '}
        <strong style={{ color: '#00ffe2' }}>{time} min</strong> to process for{' '}
        <strong>{cost} ETH</strong>
      </div>
    ) : (
      <div style={{ fontSize: '14px' }}>
        The gas price is below the market low safe price (currently about{' '}
        <strong>{condition.safeLow / 10} gwei)</strong>, your transaction might
        take forever to get confirmed
      </div>
    );
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

  getGasPriceSliderMarks() {
    const slowestValue = this.state.condition
      ? (this.state.condition.safeLow - 10) / 10
      : 1;
    const averageValue = this.state.condition
      ? this.state.condition.average / 10
      : 5;
    const fastValue = this.state.condition
      ? this.state.condition.fast / 10
      : 10;
    const marks = {};

    marks[slowestValue] = {
      style: {
        color: '#f50'
      },
      label: <strong>Slow</strong>
    };
    marks[averageValue] = {
      style: {
        color: '#fff'
      },
      label: <strong>Medium</strong>
    };
    marks[fastValue] = {
      style: {
        color: '#00ffe2'
      },
      label: <strong>Fast</strong>
    };

    return marks;
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const isMetamask = isTestnetOrMainnet(this.props.network);

    return (
      <Row id="gas-settings">
        <Col>
          {!this.props.isSimplified && <h2>Gas Setting</h2>}
          <div
            style={{
              minHeight: '100px',
              fontSize: '18px',
              fontWeight: '100'
            }}
          >
            {this.state.message}
            <Collapse bordered={false} className="m-bottom-40">
              <Panel header="Help me understand this">
                <ul>
                  <li>
                    <a
                      href="https://www.cryptocompare.com/coins/guides/what-is-the-gas-in-ethereum/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Why do I need gas?
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
                      What are the current network conditions?
                    </a>
                  </li>
                </ul>
              </Panel>
            </Collapse>
          </div>
          <Slider
            min={this.getMinValueForGasPrice()}
            max={this.getMaxValueForGasPrice()}
            value={this.state.gasprice}
            onChange={this.onGasPriceChange.bind(this)}
            step={0.01}
            tipFormatter={null}
            marks={this.getGasPriceSliderMarks()}
          />
          <Row gutter={16}>
            <Col span={24} className="m-top-40">
              <FormItem
                label={
                  <h2 style={{ position: 'relative' }}>
                    Gas Limit{' '}
                    <span style={{ fontSize: '14px', fontWeight: '300' }}>
                      (units)
                    </span>
                    <Popover
                      content="Gas limit is how many cycles (think opcodes) your transaction will take"
                      title="More about `Gas Limit`"
                      trigger="click"
                    >
                      <Icon
                        type="question-circle-o"
                        style={{
                          cursor: 'pointer',
                          position: 'absolute',
                          right: '0',
                          lineHeight: '1.8',
                          fontSize: '18px'
                        }}
                      />
                    </Popover>
                  </h2>
                }
              >
                {this.props.form ? (
                  this.props.form.getFieldDecorator('gas', {
                    initialValue: this.state.gaslimit
                  })(
                    <InputNumber
                      min={0}
                      placeholder="Gas Limit"
                      onChange={this.onGasLimitChange.bind(this)}
                      style={{ width: '100%' }}
                      disabled={isMetamask}
                    />
                  )
                ) : (
                  <InputNumber
                    min={0}
                    placeholder="Gas Limit"
                    onChange={this.onGasLimitChange.bind(this)}
                    style={{ width: '100%' }}
                    value={this.state.gaslimit}
                    disabled={isMetamask}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                label={
                  <h2 style={{ position: 'relative' }}>
                    Gas Price{' '}
                    <span style={{ fontSize: '14px', fontWeight: '300' }}>
                      (gwei)
                    </span>
                    <Popover
                      content="Gas price is how much ETH you’re willing to pay per cycle"
                      title="More about `Gas Price`"
                      trigger="click"
                    >
                      <Icon
                        type="question-circle-o"
                        style={{
                          cursor: 'pointer',
                          position: 'absolute',
                          right: '0',
                          lineHeight: '1.8',
                          fontSize: '18px'
                        }}
                      />
                    </Popover>
                  </h2>
                }
              >
                {this.props.form ? (
                  this.props.form.getFieldDecorator('gasPrice', {
                    initialValue: this.state.gasprice
                  })(
                    <InputNumber
                      min={this.getMinValueForGasPrice()}
                      onChange={this.onGasPriceChange.bind(this)}
                      placeholder="Gas Price"
                      step={0.01}
                      style={{ width: '100%' }}
                    />
                  )
                ) : (
                  <InputNumber
                    min={this.getMinValueForGasPrice()}
                    onChange={this.onGasPriceChange.bind(this)}
                    placeholder="Gas Price"
                    step={0.01}
                    value={this.state.gasprice}
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default GasPriceField;
