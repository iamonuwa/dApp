import React, { Component } from 'react';
import { Form, Input, Card, Button, DatePicker } from 'antd';
import moment from 'moment';

const FormItem = Form.Item;

const types = {
  asks: 'Sell',
  bids: 'Buy'
};

class BuyForm extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.hasErrors = this.hasErrors.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.props.form.validateFields();
    }, 100);
  }

  handleSubmit(e) {
    const { form, market } = this.props;
    e.preventDefault();

    form.validateFields((err, values) => {
      if (!err) {
        this.props.showModal();
        this.props.onSubmit({
          ...values,
          market,
          ...types[this.props.type]
        });
      }
    });
  }

  hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }

  render() {
    const { form, simExchange } = this.props;

    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched,
      getFieldsError
    } = form;

    const qtyError = isFieldTouched('qty') && getFieldError('qty');
    const priceError = isFieldTouched('price') && getFieldError('price');
    const expirationError =
      isFieldTouched('expirationTimestamp') &&
      getFieldError('expirationTimestamp');

    return (
      <div>
        <Card title={`${types[this.props.type]} ${this.props.market}`}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              validateStatus={qtyError ? 'error' : ''}
              help={qtyError || ''}
            >
              {getFieldDecorator('qty', {
                rules: [{ required: true, message: 'Please enter a quantity' }]
              })(
                <Input
                  disabled={this.props.simExchange.contract === null}
                  addonAfter=""
                  min="0"
                  step="0.01"
                  type="number"
                  placeholder="Quantity"
                />
              )}
            </FormItem>

            <FormItem
              validateStatus={priceError ? 'error' : ''}
              help={priceError || ''}
            >
              {getFieldDecorator('price', {
                rules: [{ required: true, message: 'Please enter a price' }]
              })(
                <Input
                  addonAfter={
                    simExchange.contract &&
                    simExchange.contract.COLLATERAL_TOKEN_SYMBOL
                  }
                  disabled={this.props.simExchange.contract === null}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                />
              )}
            </FormItem>

            <FormItem
              validateStatus={expirationError ? 'error' : ''}
              help={expirationError || ''}
            >
              {getFieldDecorator('expirationTimestamp', {
                rules: [
                  {
                    required: true,
                    message: 'Please select an expiration date and time.'
                  }
                ]
              })(
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
                  disabled={this.props.simExchange.contract === null}
                  showToday={false}
                  format="YYYY-MM-DD HH:mm:ss ([UTC/GMT]Z)"
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>

            <FormItem>
              <Button
                disabled={this.hasErrors(getFieldsError())}
                type="primary"
                htmlType="submit"
                style={{ width: '100%' }}
              >
                {types[this.props.type]}
              </Button>
            </FormItem>
          </Form>
        </Card>
      </div>
    );
  }
}

const WrappedForm = Form.create({
  mapPropsToFields({ order }) {
    return {
      qty: Form.createFormField({
        value: order.orderQty ? Math.abs(order.orderQty) : ''
      }),
      price: Form.createFormField({
        value: order.price
      }),
      expirationTimestamp: Form.createFormField({
        value: order.expirationTimestamp
          ? moment(
              order.expirationTimestamp,
              'YYYY-MM-DD HH:mm:ss ([UTC/GMT]Z)'
            )
          : moment().add(28, 'days')
      })
    };
  }
})(BuyForm);

export default WrappedForm;
