import { Col, Row, Steps } from 'antd';
import React, { Component } from 'react';

import StepAnimation from '../StepAnimation';
import showMessage from '../message';
import {
  DataSourceStep,
  DeployStep,
  ExpirationStep,
  NameContractStep,
  PricingStep
} from './Steps';

const Step = Steps.Step;

const parentColLayout = {
  xxl: {
    span: 10
  },
  xl: {
    span: 12
  },
  lg: {
    span: 14
  },
  md: {
    span: 18
  },
  xs: {
    span: 24
  }
};

/**
 * Component for Guided Deployment of Contracts
 *
 */
class GuidedDeployment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      step: 0,
      transitionDirection: 'next',
      contractName: '',
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
    this.setState({
      step: this.state.step + 1,
      transitionDirection: 'next'
    });
  }

  toPrevStep() {
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
    this.props.onDeployContract(this.state);
  }

  render() {
    const currentStep = this.state.step;
    const { gas, initialValues } = this.props;

    const steps = [
      <NameContractStep
        key="0"
        onNextClicked={this.toNextStep.bind(this)}
        updateDeploymentState={this.setState.bind(this)}
        {...this.state}
        {...this.props}
      />,

      <DataSourceStep
        {...this.props}
        key="3"
        onPrevClicked={this.toPrevStep.bind(this)}
        onNextClicked={this.toNextStep.bind(this)}
        updateDeploymentState={this.setState.bind(this)}
        initialValues={initialValues}
        {...this.state}
      />,

      <PricingStep
        {...this.props}
        key="1"
        onPrevClicked={this.toPrevStep.bind(this)}
        onNextClicked={this.toNextStep.bind(this)}
        updateDeploymentState={this.setState.bind(this)}
        {...this.state}
      />,

      <ExpirationStep
        {...this.props}
        key="2"
        gas={gas}
        location={this.props.location}
        onPrevClicked={this.toPrevStep.bind(this)}
        onNextClicked={this.toNextStep.bind(this)}
        updateDeploymentState={this.setState.bind(this)}
        {...this.state}
      />,

      <DeployStep
        {...this.props}
        key="4"
        deployContract={this.onDeployContract.bind(this)}
        showErrorMessage={showMessage.bind(showMessage, 'error')}
        showSuccessMessage={showMessage.bind(showMessage, 'success')}
        onFailSubmit={this.onFailSubmit.bind(this)}
        onDeployContract={this.onDeployContract.bind(this)}
        onResetDeploymentState={this.props.onResetDeploymentState}
        loading={this.props.loading}
        contract={this.props.contract}
        error={this.props.error}
        currentStep={this.props.currentStep}
        contractDeploymentTxHash={this.props.contractDeploymentTxHash}
        collateralPoolDeploymentTxHash={
          this.props.collateralPoolDeploymentTxHash
        }
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
              <Step title="Name" />
              <Step title="Data Source" />
              <Step title="Pricing" />
              <Step title="Expiration" />
              <Step title="Deploy" />
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

export default GuidedDeployment;
