import {
  DatePicker,
  Form,
  Icon,
  Input,
  InputNumber,
  Select,
  Popover
} from 'antd';
import moment from 'moment';
import React from 'react';
import FormValidators from '../../util/forms/Validators';
import store from '../../store';
import OracleDataSources, {
  getDataSourceObj
} from '../TestQuery/OracleDataSources';
import ExchangeSources from './ExchangeSources';

const FormItem = Form.Item;
const Option = Select.Option;

const ethAddressValidator = (rule, value, callback) => {
  const web3 = store.getState().web3.web3Instance;
  FormValidators(web3).checkERC20Contract(value, callback);
};

const timestampValidator = (rule, value, callback) => {
  callback(value > moment() ? undefined : 'Expiration must be in the future');
};

const priceFloorValidator = (form, rule, value, callback) => {
  const priceCap = form.getFieldValue('priceCap');

  callback(
    value <= priceCap
      ? undefined
      : 'Price floor must be less-than or equal to the price cap'
  );
};

const priceCapValidator = (form, rule, value, callback) => {
  const priceFloor = form.getFieldValue('priceFloor');

  callback(
    value >= priceFloor
      ? undefined
      : 'Price cap must be greater-than or equal to the price floor'
  );
};

const priceFloorSimplifiedValidator = (form, rule, value, callback) => {
  const priceCap = form.getFieldValue('priceCapSimplified');
  const price = form.getFieldValue('price');

  // just picked a number lower than the default of 0.5 * price
  if (value < 0.45 * price) {
    callback('Price floor must be larger than 45% of the current price');
  }

  callback(
    value <= priceCap
      ? undefined
      : 'Price floor must be less-than or equal to the price cap'
  );
};

const priceCapSimplifiedValidator = (form, rule, value, callback) => {
  const priceFloor = form.getFieldValue('priceFloorSimplified');
  const price = form.getFieldValue('price');

  // just picked a number larger than the default of 1.5 * price
  if (value > 1.55 * price) {
    callback('Price cap must be smaller than 155% of the current price');
  }

  callback(
    value >= priceFloor
      ? undefined
      : 'Price cap must be greater-than or equal to the price floor'
  );
};

const oracleQueryValidator = (form, rule, value, callback) => {
  const oracleDataSource = form.getFieldValue('oracleDataSource');
  const oracleQuery = form.getFieldValue('oracleQuery');
  const dataSourceObj = getDataSourceObj(oracleDataSource);

  if (dataSourceObj) {
    callback(
      dataSourceObj.isQueryValid(oracleQuery)
        ? undefined
        : `Invalid Query for '${oracleDataSource}' Data Source. A valid example is: ${
            dataSourceObj.sampleQueries[0].query
          }`
    );
  } else {
    callback(undefined);
  }
};

const Hint = props => (
  <Popover
    content={props.hint}
    title={'More about `' + props.hintTitle + '`'}
    trigger="click"
  >
    <Icon type="question-circle-o" style={{ cursor: 'pointer' }} />
  </Popover>
);

const fieldSettingsByName = {
  contractName: {
    label: 'Name',
    initialValue: 'ETH/BTC-Kraken_YYYY-MM-DD',
    rules: [
      {
        required: true,
        message: 'Please enter a name for your contract'
      }
    ],
    extra: `Name of contract should be descriptive, e.g. "ETH/BTC-20180228-Kraken"`,
    component: ({ showHint }) => <Input />
  },

  contractNameSimplified: {
    initialValue: 'ETH/BTC-Kraken_YYYY-MM-DD',
    rules: [
      {
        required: true,
        message: 'Please enter a name for your contract'
      }
    ],
    extra: `Name of contract should be descriptive, e.g. "ETH/BTC-20180228-Kraken"`,
    component: ({ showHint }) => <Input />
  },

  collateralTokenAddress: {
    label: 'Base Token Address',
    initialValue: '0x3333333333333333333333333333333333333333',
    rules: [
      {
        required: true,
        message: 'Please enter a base token address'
      },
      {
        validator: ethAddressValidator
      }
    ],
    extra:
      'This is the token that collateralizes the contract, it can be any valid ERC20 token',

    component: () => <Input />
  },

  priceFloor: {
    label: 'Price Floor',
    initialValue: 0,
    rules: form => {
      return [
        {
          required: true,
          message: 'Please enter a price floor'
        },
        {
          type: 'integer',
          message: 'Value must be an integer'
        },
        {
          validator: (rule, value, callback) => {
            priceFloorValidator(form, rule, value, callback);
          }
        }
      ];
    },
    extra: `The lower bound of price exposure this contract will trade. If the oracle reports a price below this 
    value the contract will enter into settlement`,

    component: ({ form }) => {
      return (
        <InputNumber
          min={0}
          style={{ width: '100%' }}
          onChange={() => {
            setTimeout(() => {
              form.validateFields(['priceCap'], { force: true });
            }, 100);
          }}
        />
      );
    }
  },

  priceCap: {
    label: 'Price Cap',
    initialValue: 150,
    rules: form => {
      return [
        {
          required: true,
          message: 'Please enter a price cap'
        },
        {
          type: 'integer',
          message: 'Value must be an integer'
        },
        {
          validator: (rule, value, callback) => {
            priceCapValidator(form, rule, value, callback);
          }
        }
      ];
    },
    extra: `The upper bound of price exposure this contract will trade. If the oracle reports a price above this
    value the contract will enter into settlement`,

    component: ({ form }) => {
      return (
        <InputNumber
          min={0}
          style={{ width: '100%' }}
          onChange={() => {
            setTimeout(() => {
              form.validateFields(['priceFloor'], { force: true });
            }, 100);
          }}
        />
      );
    }
  },

  priceFloorSimplified: {
    initialValue: 0,
    rules: form => {
      return [
        {
          required: true,
          message: 'Please enter a price floor'
        },
        {
          type: 'number',
          message: 'Value must be a number'
        },
        {
          validator: (rule, value, callback) => {
            priceFloorSimplifiedValidator(form, rule, value, callback);
          }
        }
      ];
    },
    extra: `The lower bound of price exposure this contract will trade. If the oracle reports a price below this 
    value the contract will enter into settlement`,

    component: ({ form }) => {
      return (
        <InputNumber
          min={0}
          style={{ width: '100%' }}
          onChange={() => {
            setTimeout(() => {
              form.validateFields(['priceCapSimplified'], { force: true });
            }, 100);
          }}
        />
      );
    }
  },

  priceCapSimplified: {
    initialValue: 150,
    rules: form => {
      return [
        {
          required: true,
          message: 'Please enter a price cap'
        },
        {
          type: 'number',
          message: 'Value must be a number'
        },
        {
          validator: (rule, value, callback) => {
            priceCapSimplifiedValidator(form, rule, value, callback);
          }
        }
      ];
    },
    extra: `The upper bound of price exposure this contract will trade. If the oracle reports a price above this
    value the contract will enter into settlement`,

    component: ({ form }) => {
      return (
        <InputNumber
          min={0}
          style={{ width: '100%' }}
          onChange={() => {
            setTimeout(() => {
              form.validateFields(['priceFloorSimplified'], { force: true });
            }, 100);
          }}
        />
      );
    }
  },

  price: {
    // Hidden field for the symbol price for simplified contract deployment for easier validation of price floor and cap
    component: () => <Input type="hidden" />
  },

  priceDecimalPlaces: {
    label: 'Price Decimal Places',
    initialValue: 2,
    rules: [
      {
        required: true,
        message: 'Please enter the number of decimal places of the price'
      },
      {
        type: 'integer',
        message: 'Value must be an integer'
      }
    ],
    extra: `Since all numbers must be represented as integers on the Ethereum blockchain, this is how many 
    decimal places one needs to move the decimal in order to go from the oracle query price to an integer. 
    For instance if the oracle query results returned a value such as 190.22, we need to move the 
    decimal two(2) places to convert to an integer value of 19022.`,

    component: () => <InputNumber min={0} style={{ width: '100%' }} />
  },

  qtyMultiplier: {
    label: 'Qty Multiplier',
    initialValue: 2,
    rules: [
      {
        required: true,
        message: 'Please enter a valid quantity multiplier'
      },
      {
        type: 'integer',
        message: 'Value must be an integer'
      }
    ],
    extra: `The qty multiplier allows the user to specify how many base units (for ethereum, this would be wei) each
    integer price movement changes the value of the contract.  If our integerized price was 19022 with a qty
    multiplier of 1, and the price moved to 19023, then the value will have change by 1 wei.  If however the
    multiplier was set at 1,000,000,000 the price movement of 1 unit would now
    correspond to a value of 1 gwei (not wei)`,

    component: () => <InputNumber min={0} style={{ width: '100%' }} />
  },

  expirationTimeStamp: {
    label: 'Expiration Time',
    initialValue: moment().add(28, 'days'),
    rules: [
      {
        required: true,
        message: 'Please enter an expiration time'
      },
      {
        validator: timestampValidator
      }
    ],
    extra:
      'Expiration timestamp for all open positions to settle. Cannot be more than 60 days from now.',

    component: () => (
      <DatePicker
        showTime
        disabledDate={current => {
          const now = moment().startOf('day');
          return (
            current &&
            (current.valueOf() < moment().endOf('day') ||
              current.diff(now, 'days') > 60)
          );
        }}
        showToday={false}
        format="YYYY-MM-DD HH:mm:ss"
        style={{ width: '100%' }}
      />
    )
  },

  expirationTimeStampSimplified: {
    initialValue: moment().add(28, 'days'),
    rules: [
      {
        required: true,
        message: 'Please enter an expiration time'
      },
      {
        validator: timestampValidator
      }
    ],
    extra:
      'Expiration timestamp for all open positions to settle. Cannot be more than 60 days from now.',

    component: () => (
      <DatePicker
        showTime
        disabledDate={current => {
          const now = moment().startOf('day');
          return (
            current &&
            (current.valueOf() < moment().endOf('day') ||
              current.diff(now, 'days') > 60)
          );
        }}
        showToday={false}
        format="YYYY-MM-DD HH:mm:ss"
        style={{ width: '100%' }}
      />
    )
  },

  oracleDataSource: {
    label: 'Oraclize.it data source',
    initialValue: 'URL',
    rules: [
      {
        required: true,
        message: 'Please select a data source'
      }
    ],
    extra: 'Available data sources from Oraclize.it',

    component: () => {
      return (
        <Select>
          {OracleDataSources.map(dataSource => (
            <Option key={dataSource.name} value={dataSource.name}>
              {dataSource.name}
            </Option>
          ))}
        </Select>
      );
    }
  },

  oracleQuery: {
    label: 'Oraclize.it Query',
    initialValue:
      'json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0',
    rules: form => [
      {
        required: true,
        message: 'Please enter a valid query'
      },
      {
        validator: (rule, value, callback) => {
          oracleQueryValidator(form, rule, value, callback);
        }
      }
    ],
    extra:
      'Properly structured Oraclize.it query, please use the test query page for clarification',

    component: () => <Input />
  },

  exchangeApi: {
    initialValue: 'Binance',
    rules: [
      {
        required: true,
        message: 'Please select an exchange api'
      }
    ],
    extra: 'Available exchange api',

    component: ({ onChange }) => {
      return (
        <Select onChange={onChange}>
          {ExchangeSources.map(exchange => (
            <Option key={exchange.key} value={exchange.key}>
              {exchange.name}
            </Option>
          ))}
        </Select>
      );
    }
  }
};

function DeployContractField(props) {
  const { name, form, initialValue, showHint, onChange } = props;
  const { getFieldDecorator } = form;
  const fieldSettings = fieldSettingsByName[name];

  const rules =
    typeof fieldSettings.rules === 'function'
      ? fieldSettings.rules(form)
      : fieldSettings.rules;
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
        fieldSettings.component({
          form,
          fieldSettings,
          showHint,
          onChange
        })
      )}
    </FormItem>
  );
}

export const FieldSettings = fieldSettingsByName;
export default DeployContractField;
