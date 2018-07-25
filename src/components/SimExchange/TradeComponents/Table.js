import React, { Component } from 'react';
import uniqueId from 'lodash/uniqueId';

import { Table } from 'antd';
import { fromBaseUnit } from '../../../util/utils';

import './Table.less';

class OrdersTable extends Component {
  render() {
    const columns = [
      {
        title: 'Amount',
        dataIndex: 'orderQty',
        key: 'orderQty',
        render: text => text
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render: text =>
          fromBaseUnit(
            parseInt(text, 10),
            parseInt(this.props.contract.priceDecimalPlaces, 10)
          )
      }
    ];

    return (
      <Table
        pagination={false}
        title={() => this.props.title}
        size="small"
        dataSource={this.props.data}
        columns={columns}
        rowKey={() => uniqueId('orderHash')}
      />
    );
  }
}

export default OrdersTable;
