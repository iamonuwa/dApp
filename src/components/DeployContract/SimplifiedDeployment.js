import { Col, Row, Steps } from 'antd';
import React, { Component } from 'react';

import StepAnimation from '../StepAnimation';
import {
  DeployStep,
  ExpirationStep,
  ExchangeStep,
  GasStep,
  PricingStep
} from './Steps';

import showMessage from '../message';
import { getCollateralTokenAddress } from '../../util/utils';

const Step = Steps.Step;

const parentColLayout = {
  xl: {
    span: 8
  },
  md: {
    span: 12
  },
  xs: {
    span: 24
  }
};

/**
 * Component for Simplified Deployment of Contracts
 *
 */
class SimplifiedDeployment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      step: 0,
      transitionDirection: 'next',
      contractName: '',
      quoteAsset: '',
      collateralTokenAddress: '',
      priceFloor: '',
      priceCap: '',
      priceDecimalPlaces: '',
      qtyMultiplier: '',
      expirationTimeStamp: '',
      oracleDataSource: '',
      oracleQuery: ''
    };
  }

  toNextStep() {
    window.scrollTo(0, 0);
    this.setState({
      step: this.state.step + 1,
      transitionDirection: 'next'
    });
  }

  toPrevStep() {
    window.scrollTo(0, 0);
    this.setState({
      step: this.state.step - 1,
      transitionDirection: 'prev'
    });
  }

  onFailSubmit() {
    this.setState({
      step: 0,
      transitionDirection: 'prev'
    });
  }

  onDeployContract() {
    const { network } = this.props;

    // fix decimal points.
    // this simply assumes the decimal places of the original price.
    // Since we limit the floor-cap range to 45% to 155%, this is a good estimate
    // and we shouldn't loose much in terms of precission
    this.setState(
      {
        collateralTokenAddress: getCollateralTokenAddress(
          network,
          this.state.quoteAsset
        ),
        priceFloor: Math.round(
          this.state.priceFloorSimplified * 10 ** this.state.priceDecimalPlaces
        ),
        priceCap: Math.round(
          this.state.priceCapSimplified * 10 ** this.state.priceDecimalPlaces
        )
      },
      () => this.props.onDeployContract(this.state)
    );
  }

  render() {
    const currentStep = this.state.step;
    const { gas } = this.props;

    const steps = [
      <ExchangeStep
        key="0"
        onNextClicked={this.toNextStep.bind(this)}
        updateDeploymentState={this.setState.bind(this)}
        isSimplified={true}
        {...this.state}
        {...this.props}
      />,

      <PricingStep
        key="1"
        onPrevClicked={this.toPrevStep.bind(this)}
        onNextClicked={this.toNextStep.bind(this)}
        updateDeploymentState={this.setState.bind(this)}
        isSimplified={true}
        {...this.state}
        {...this.props}
      />,

      <ExpirationStep
        key="2"
        location={this.props.location}
        onPrevClicked={this.toPrevStep.bind(this)}
        onNextClicked={this.toNextStep.bind(this)}
        updateDeploymentState={this.setState.bind(this)}
        isSimplified={true}
        {...this.state}
      />,

      <GasStep
        key="3"
        gas={gas}
        location={this.props.location}
        onPrevClicked={this.toPrevStep.bind(this)}
        onNextClicked={this.toNextStep.bind(this)}
        updateDeploymentState={this.setState.bind(this)}
        isSimplified={true}
        {...this.state}
        {...this.props}
      />,

      <DeployStep
        key="4"
        deployContract={this.onDeployContract.bind(this)}
        showErrorMessage={showMessage.bind(showMessage, 'error')}
        showSuccessMessage={showMessage.bind(showMessage, 'success')}
        onFailSubmit={this.onFailSubmit.bind(this)}
        onDeployContract={this.onDeployContract.bind(this)}
        history={this.props.history}
        onResetDeploymentState={this.props.onResetDeploymentState}
        loading={this.props.loading}
        contract={this.props.contract}
        error={this.props.error}
        currentStep={this.props.currentStep}
        contractDeploymentTxHash={this.props.contractDeploymentTxHash}
        collateralPoolDeploymentTxHash={
          this.props.collateralPoolDeploymentTxHash
        }
        {...this.props}
      />
    ];

    return (
      <div className="page">
        <Row type="flex" justify="center" style={{ margin: '20px 0' }}>
          <Col span={18}>
            <Steps
              network={this.props.network}
              current={currentStep}
              style={{ marginBottom: '40px' }}
            >
              <Step title="Exchange" />
              <Step title="Pricing" />
              <Step title="Expiration" />
              <Step title="Gas" />
              <Step network={this.props.network} title="Deploy" />
            </Steps>
          </Col>
        </Row>
        <Row type="flex" justify="center">
          <Col {...parentColLayout}>
            <StepAnimation direction={this.state.transitionDirection}>
              {steps.filter((step, index) => currentStep === index)}
            </StepAnimation>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SimplifiedDeployment;
