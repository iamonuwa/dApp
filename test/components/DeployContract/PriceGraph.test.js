import React, { Component } from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { PriceGraph } from '../../../src/components/DeployContract/PriceGraph';

describe("Price cap/floor graph", () => {
  let wrapper;
  const priceFloor = 1;
  const price = 2;
  const priceCap = 3;

  beforeAll(() => {
    wrapper = render((<PriceGraph priceFloor={priceFloor} price={price} priceCap={priceCap} />))
  })

  it('renders the canvas', () => {
    expect(wrapper[0].name).to.equal('canvas');
  });

  it('is correct width and height', () => {
    expect(wrapper[0].attribs.width).to.equal('300');
    expect(wrapper[0].attribs.height).to.equal('160');
  });
});