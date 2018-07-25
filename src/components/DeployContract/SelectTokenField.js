import { Form, Icon, Select, Popover } from 'antd';
import React from 'react';
import { getExchangeObj } from './ExchangeSources';

const FormItem = Form.Item;
const { Option, OptGroup } = Select;

const Hint = props => (
  <Popover
    content={props.hint}
    title={'More about `' + props.hintTitle + '`'}
    trigger="click"
  >
    <Icon type="question-circle-o" style={{ cursor: 'pointer' }} />
  </Popover>
);

class SelectTokenField extends React.Component {
  constructor() {
    super();
    this.state = {
      pairs: [],
      quotes: ['ETH', 'USDT']
    };
    this.updateList = this.updateList.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.exchange !== prevProps.exchange) {
      this.setState({ pairs: [] });
      this.props.onSelect({
        contractName: '',
        oracleQuery: '',
        quoteAsset: '',
        priceDecimalPlaces: '',
        priceCap: '',
        priceFloor: '',
        qtyMultiplier: '',
        oracleDataSource: ''
      });
      getExchangeObj(prevProps.exchange)
        .fetchList(this.state.quotes)
        .subscribe(this.updateList);
    }
  }
  updateList(symbols) {
    this.setState({ pairs: symbols });
  }

  handleSelect(e) {
    const exchange = getExchangeObj(this.props.exchange);
    const symbol = this.state.pairs[e];
    if (exchange.getPrice) {
      const onSelect = this.onSelect;
      exchange.getPrice(symbol.symbol).subscribe(price => {
        symbol.price = price;
        onSelect(symbol, exchange);
      });
    } else {
      this.onSelect(symbol, exchange);
    }
  }

  onSelect(symbol, exchange) {
    this.props.onSelect({
      contractName: this.genContractName(symbol),
      symbolName: symbol.symbol,
      quoteAsset: symbol.quoteAsset,
      oracleQuery: exchange.genOracleQuery(symbol),
      price: symbol.price * 1.0, // force number
      priceDecimalPlaces: symbol.priceDecimalPlaces,
      priceCap: symbol.price * 1.5,
      priceFloor: symbol.price * 0.5,
      qtyMultiplier: 10 ** (18 - symbol.priceDecimalPlaces),
      oracleDataSource: 'URL'
    });
  }

  genContractName(symbol) {
    return `${this.props.exchange}_${symbol.symbol}_${
      symbol.quoteAsset
    }_${Date.now()}`;
  }

  componentDidMount() {
    getExchangeObj(this.props.exchange)
      .fetchList(this.state.quotes)
      .subscribe(this.updateList);
  }

  render() {
    const { name, form, initialValue, showHint } = this.props;
    const { getFieldDecorator } = form;
    const fieldSettings = {
      label: 'Select ETH or USDT based pair',
      extra: 'Available ETH or USDT based pairs from exchange'
    };

    const rules = [
      {
        required: true,
        message: 'Please select a token pairs'
      }
    ];
    const label = (
      <span>
        {fieldSettings.label}{' '}
        {showHint && (
          <Hint hint={fieldSettings.extra} hintTitle={fieldSettings.label} />
        )}
      </span>
    );
    return (
      <FormItem label={label}>
        {getFieldDecorator(name, {
          initialValue,
          rules
        })(
          <Select
            showSearch={true}
            defaultActiveFirstOption={false}
            allowClear={true}
            onSelect={this.handleSelect}
            optionFilterProp="children"
            filterOption={function(inputValue, option) {
              return (
                option.props.children.indexOf(inputValue.toUpperCase()) >= 0
              );
            }}
          >
            {this.state.quotes.map(quoteAsset => (
              <OptGroup key={quoteAsset} label={quoteAsset}>
                {this.state.pairs.map(
                  (symbol, index) =>
                    symbol.quoteAsset === quoteAsset && (
                      <Option key={index} value={index}>
                        {symbol.symbol}
                      </Option>
                    )
                )}
              </OptGroup>
            ))}
          </Select>
        )}
      </FormItem>
    );
  }
}

export default SelectTokenField;
