/**
 * Steps for use by GuidedDeployment.
 *
 */
import { Button, Col, Form, Icon, Row, Collapse, Timeline } from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Loader from '../Loader';
import Field, { FieldSettings } from './DeployContractField';
import DeployContractSuccess from './DeployContractSuccess';
import GasPriceField from '../GasPriceField';
import SelectTokenField from './SelectTokenField';
import { getEtherscanUrl } from '../../util/utils';

// extract antd subcomponents
const Panel = Collapse.Panel;

function BiDirectionalNav(props) {
  console.log(props);
  return (
    <div
      className="step-button-nav-container"
      style={props.isSimplified ? { width: '480px' } : { width: '100%' }}
    >
      {props.step > 0 && (
        <Button onClick={props.onPrevClicked} className="step-back-button">
          <Icon type="left" />Back
        </Button>
      )}
      <Button htmlType="submit">
        {props.text}
        <Icon type="right" />
      </Button>
    </div>
  );
}

class BaseStepComponent extends Component {
  /**
   * Validates form and updates Deployment State
   *
   * @param {*} e
   */
  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      const timestamp = fieldsValue['expirationTimeStamp']
        ? {
            expirationTimeStamp: Math.floor(
              fieldsValue['expirationTimeStamp'].valueOf() / 1000
            )
          }
        : {};
      this.props.updateDeploymentState({
        ...fieldsValue,
        ...timestamp
      });
      this.props.onNextClicked();
    });
  }
}

/**
 * First step in the guided contract.
 * It displays two fields. First to collect name of the contract and
 * second to collect the base address.
 *
 */
class NameContractStep extends BaseStepComponent {
  render() {
    const contractNameSettings = FieldSettings.contractName;
    const collateralTokenSettings = FieldSettings.collateralTokenAddress;

    return (
      <div>
        <Form onSubmit={this.handleSubmit.bind(this)} layout="vertical">
          <h1>Contract Name and Collateral Token</h1>
          <div>
            MARKET allows users to create user defined derivative contracts by
            outlining the needed specifications. This guide will walk you
            through creating a contract and the important variables.
          </div>
          <br />
          <h2>Contract Name</h2>
          <div>
            The contract name should be as descriptive as possible capturing the
            underlying asset relationship as well as possibly the expiration.
            Something like "<b>{contractNameSettings.initialValue}</b>" may help
            others understand the underlying asset, the data source, and
            expiration date in a nice human readable and searchable way.
            <br />
            <br />
            In the future, MARKET will implement a standardized naming
            convention and guidelines to formalize this process
            <br />
            <br />
            Example name <b>ETH/BTC-Kraken_2018-03-01</b>
          </div>
          <br />
          <Field
            name="contractName"
            initialValue={this.props.contractName}
            form={this.props.form}
          />
          <h2>Collateral Token</h2>
          <div>
            Next, every contract should be backed by an ERC20 Token that will be
            used a collateral for the contract. Traders must deposit tokens to
            the smart contract prior to trading, and upon execution of a trade,
            the appropriate amount of collateral becomes locked until that
            position is exited. In this fashion, all open positions always
            remain 100% collateralized removing counter party risk from the
            traders. Please specify a ERC20 Token address for this contract.
            <br />
            <br />
            In the future, users will be able to easily select from well known
            ERC20 tokens to ensure more safety and avoid dealing with long
            addresses.
            <br />
            <br />
            Example address <b>{collateralTokenSettings.initialValue}</b>
          </div>
          <br />
          <Field
            name="collateralTokenAddress"
            initialValue={this.props.collateralTokenAddress}
            form={this.props.form}
          />
          <BiDirectionalNav text="Select Oracle" {...this.props} />
        </Form>
      </div>
    );
  }
}

NameContractStep = Form.create()(NameContractStep);

/**
 * Step for Setting Price Cap and floor
 *
 */
class PricingStep extends BaseStepComponent {
  render() {
    return (
      <Form
        className={this.props.isSimplified ? 'step-container' : ''}
        onSubmit={this.handleSubmit.bind(this)}
        layout="vertical"
        hideRequiredMark={true}
      >
        <h1>Specify Pricing Rules</h1>
        {this.props.isSimplified && (
          <h3>
            Current Price of {this.props.symbolName}:{' '}
            <span className="text-primary">{this.props.price}</span>
          </h3>
        )}
        {!this.props.isSimplified && (
          <div>
            The Price Floor and Cap define the range of a contract. If an oracle
            reports a price above a Cap or below a Floor the contract will enter
            settlement and no longer trade. Additionally, these parameters
            define a participants maximum loss when entering a trade and
            therefore the amount collateral that must be posted.
            <br />
            <br />
            <h3>
              All prices must in an integer format (e.g 1245, not 12.45),
              floating point values (decimals), are not currently supported by
              Ethereum.
            </h3>
          </div>
        )}
        <br />
        {!this.props.isSimplified && (
          <div>
            <h2>Price Decimal Places</h2>
            <div>
              Ethereum currently does not support floating points numbers.
              Therefore all prices reported by oracles must be converted to a
              whole number (integer). This variable is how many decimal places
              one needs to move the decimal in order to go from the oracle query
              price to an integer. For example, if the oracle query results
              returned a value of 190.22, we need to move the decimal two (2)
              places to convert to a whole number of 19022, so we would enter 2
              below.
            </div>
            <br />
            <Field
              name="priceDecimalPlaces"
              initialValue={this.props.priceDecimalPlaces}
              form={this.props.form}
            />
          </div>
        )}
        <div className={this.props.isSimplified ? 'step-inner-container' : ''}>
          <h2>Price Floor</h2>
          {!this.props.isSimplified && (
            <div className="m-bottom-20">
              This is the lower bound of price exposure this contract will
              trade. If the oracle reports a price below this value the contract
              will enter into settlement. This should also be represented as a
              whole number. If we take the example above of a price of 190.22
              and decide the Floor for our contract should be 150.00, we would
              enter 15000 here.
            </div>
          )}
          <Field
            name={
              this.props.isSimplified ? 'priceFloorSimplified' : 'priceFloor'
            }
            initialValue={this.props.priceFloor}
            form={this.props.form}
          />
          <br />

          <h2>Price Cap</h2>
          {!this.props.isSimplified && (
            <div className="m-bottom-20">
              This is the upper bound of price exposure this contract will
              trade. If the oracle reports a price above this value the contract
              will enter into settlement. Following our example, if we decide
              the Cap for our contract should be 230.00, we would enter 23000 as
              our Cap.
            </div>
          )}
          <Field
            name={this.props.isSimplified ? 'priceCapSimplified' : 'priceCap'}
            initialValue={this.props.priceCap}
            form={this.props.form}
          />
        </div>
        <br />
        {!this.props.isSimplified && (
          <div>
            <h2>Price Quantity Multiplier</h2>
            <div>
              The quantity multiplier allows the user to specify how many base
              units (for Ethereum, this would be wei) each integer price
              movement changes the value of the contract. If our integerized
              price was 19022 with a qty multiplier of 1, and the price moved to
              19023, then the value will have change by 1 wei. If however the
              multiplier was set at 1,000,000,000 the price movement of 1 unit
              would now correspond to a value of 1 gwei (not wei). Please see{' '}
              <a
                href="https://etherconverter.online/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                here{' '}
              </a>{' '}
              for an ethereum unit converter.
            </div>
            <br />
            <Field
              name="qtyMultiplier"
              initialValue={this.props.qtyMultiplier}
              form={this.props.form}
            />
          </div>
        )}
        <BiDirectionalNav text="Set Expiration Time" {...this.props} />
      </Form>
    );
  }
}

PricingStep = Form.create()(PricingStep);

/**
 * Step for setting the expiration time for the contract
 *
 */
class ExpirationStep extends BaseStepComponent {
  render() {
    const {
      expirationTimeStamp,
      form,
      gas,
      isSimplified,
      location
    } = this.props;

    return (
      <Form
        className={isSimplified ? 'step-container' : ''}
        onSubmit={this.handleSubmit.bind(this)}
        layout="vertical"
        hideRequiredMark={true}
      >
        <h1 className={isSimplified ? 'text-center' : ''}>Set Expiration</h1>
        {!isSimplified && (
          <div>
            Upon reaching the expiration timestamp all open positions will
            settle against the final price query returned by the oracle.
          </div>
        )}
        <br />
        <div className={isSimplified ? 'step-inner-container' : ''}>
          <h2>
            Date & Time{' '}
            <span style={{ fontSize: '14px' }}>
              ({moment().format('[UTC/GMT]Z')})
            </span>
          </h2>
          <Field
            name="expirationTimeStampSimplified"
            initialValue={
              expirationTimeStamp
                ? moment(expirationTimeStamp * 1000)
                : isSimplified
                  ? moment().add(30, 'days')
                  : ''
            }
            form={form}
          />
          {!isSimplified && (
            <GasPriceField form={form} gaslimit={gas} location={location} />
          )}
        </div>
        <BiDirectionalNav text="Deploy Contract" {...this.props} />
      </Form>
    );
  }
}

ExpirationStep = Form.create()(ExpirationStep);

/**
 * Step to select the Oracle Data source and the query frequency for the contract
 *
 */
class DataSourceStep extends BaseStepComponent {
  render() {
    const { initialValues } = this.props;
    return (
      <div>
        <Form onSubmit={this.handleSubmit.bind(this)} layout="vertical">
          <h1>Set Oracle Data Source</h1>
          <div>
            Currently, Oraclize.it offers several different options for their
            data source. If you need help creating a proper oracle query, or
            availabe data sources please refer to the{' '}
            <a href="/test" target="_blank">
              Test Query
            </a>{' '}
            page.
          </div>
          <br />
          <h2>Select Data Source</h2>
          <div>Available data sources from Oraclize.it</div>
          <br />
          <Field
            name="oracleDataSource"
            initialValue={
              this.props.oracleDataSource || initialValues.oracleDataSource
            }
            form={this.props.form}
          />

          <h2>Oracle Query</h2>
          <div>
            Properly structured Oraclize.it query, Please use the{' '}
            <a href="/test" target="_blank">
              Test Query
            </a>{' '}
            page for clarification.
          </div>
          <br />
          <Field
            name="oracleQuery"
            initialValue={this.props.oracleQuery || initialValues.oracleQuery}
            form={this.props.form}
          />
          <BiDirectionalNav text="View Pricing Rules" {...this.props} />
        </Form>
      </div>
    );
  }
}

DataSourceStep = Form.create()(DataSourceStep);

/**
 * Step to select appropriate Gas amount for the contract deployment
 *
 */
class GasStep extends BaseStepComponent {
  render() {
    const { form, gas, location } = this.props;
    return (
      <div>
        <Form
          className="step-container"
          onSubmit={this.handleSubmit.bind(this)}
          layout="vertical"
        >
          <h1>Gas Settings</h1>
          <div className="step-inner-container">
            <GasPriceField
              form={form}
              gaslimit={gas}
              location={location}
              isSimplified={true}
            />
          </div>
          <BiDirectionalNav text="Deploy Contract" {...this.props} />
        </Form>
      </div>
    );
  }
}

GasStep = Form.create()(GasStep);

/*
  *  [WIP] Modifying UX flow for contract deployment to be more
  *        stepwise, descriptive, and educational.
  *
  *        See https://github.com/MARKETProtocol/dApp/issues/187.
 */
class DeployStep extends BaseStepComponent {
  constructor(props) {
    super(props);

    this.panelKeys = [
      'Contract Deployment',
      'Collateral Pool Deployment',
      'Deployment Results'
    ];

    this.panelConfig = {
      'Contract Deployment': {
        key: 'Contract Deployment',
        stepNum: 1,
        pendingText: 'Pending',
        loadingText: 'Waiting for transaction',
        completedText: 'Deployed',
        errorText: 'Cancelled',
        subactions: [
          {
            title: 'Deploying your MarketContract',
            explanation:
              'The MarketContract is the main contract responsible for facilitating many to many trading. Your customized contract is about to be deployed to the Ethereum blockchain and will soon be tradeable!'
          },
          {
            title: 'Adding your contract to our registry',
            explanation: `We want other's to be able to find your awesome new contract, and are adding it to our registry so it will show up in the Contract Explorer page.`
          }
        ]
      },
      'Collateral Pool Deployment': {
        key: 'Collateral Pool Deployment',
        stepNum: 2,
        pendingText: 'Pending',
        loadingText: 'Waiting for transaction',
        completedText: 'Deployed',
        errorText: 'Cancelled',
        subactions: [
          {
            title: 'Deploying a new Collateral Pool for your contract',
            explanation:
              'Each MARKET Protocol Smart Contract needs its own collateral pool to ensure that all trades are always 100% collateralized and solvent!'
          },
          {
            title: 'Linking the Collateral Pool to your contract',
            explanation:
              'Finally, we must link your newly deployed contracts together to ensure all functionality is in place. Shortly, your contract will be all set for use. Happy Trading!'
          }
        ]
      },
      'Deployment Results': {
        key: 'Deployment Results',
        stepNum: 3,
        pendingText: 'Pending',
        loadingText: 'Processing',
        errorText: 'Rejected',
        completedText: 'Succeeded'
      }
    };

    this.initialState = {
      currStepNum: 1,
      activePanelKey: 'Contract Deployment',
      txHashes: {
        'Contract Deployment': null,
        'Collateral Pool Deployment': null
      }
    };

    this.state = Object.assign({}, this.initialState);
  }

  /*
   *  Possible values for 'props.currentStep', in order
   *  ------------------------------------------------------------------------
   *  [null]
   *    Uninitialized.
   *  [rejected]
   *    Something went wrong, deployment is cancelled, and an error message
   *    is exposed in 'props.error'.
   *  [pending]
   *    Waiting for contract deployment to start.
   *  [contractDeploying]
   *    Waiting for market contract deployment to complete.
   *  [collateralPoolDeploying]
   *    Waiting for market collateral pool deployment to complete.
   *  [deploymentComplete]
   *    Market collateral pool deployment has completed.
   *  [fulfilled]
   *    Full deployment process has completed and contract information is now
   *    exposed in 'props.contract'.
  **/
  componentWillReceiveProps(nextProps) {
    if (this.props.currentStep !== nextProps.currentStep) {
      this.onUpdateCurrStep(nextProps.currentStep);
    }

    this.onUpdateTxHashes(nextProps);

    if (this.props.loading && !nextProps.loading) {
      if (nextProps.error) {
        // We had an error
        this.props.showErrorMessage(
          `There was an error deploying the contract: ${nextProps.error}`,
          8
        );
      } else if (nextProps.contract) {
        // Contract was deployed
        this.props.showSuccessMessage(
          DeployContractSuccess({ contract: nextProps.contract }),
          5
        );
      }
    }
  }

  componentDidMount() {
    if (this.props.deployContract) {
      this.props.deployContract();
    }
  }

  componentWillUnmount() {
    this.props.onResetDeploymentState();
  }

  onRetry() {
    this.setState(Object.assign(this.initialState));
    this.props.onResetDeploymentState({
      preservations: {
        currentStep: 'pending'
      }
    });
    this.props.onDeployContract();
  }

  onUpdateCurrStep(currentStep) {
    // determine new step number
    let currStepNum;
    switch (currentStep) {
      case null:
      case 'pending':
      case 'contractDeploying':
        currStepNum = 1;
        break;
      case 'deploymentComplete':
      case 'collateralPoolDeploying':
        currStepNum = 2;
        break;
      case 'rejected':
      case 'fulfilled':
        currStepNum = 3;
        break;
      default:
        currStepNum = 1;
    }

    // update state and trigger active panel change on slight delay to make
    // updated tx hash/loader changes visible
    this.setState(
      {
        currStepNum
      },
      () =>
        currStepNum >= 1 && currStepNum <= 3
          ? setTimeout(
              () => this.onChangeActivePanel(this.panelKeys[currStepNum - 1]),
              'rejected' === currentStep ? 0 : 1250
            )
          : null
    );
  }

  onUpdateTxHashes(nextProps) {
    let { txHashes } = this.state;

    txHashes['Contract Deployment'] = nextProps.contractDeploymentTxHash;
    txHashes['Collateral Pool Deployment'] =
      nextProps.collateralPoolDeploymentTxHash;

    this.setState({ txHashes });
  }

  onChangeActivePanel(newActivePanelKey) {
    this.setState({
      activePanelKey: newActivePanelKey
    });
  }

  renderPanel(config) {
    let { currStepNum, txHashes } = this.state;
    let {
      key,
      stepNum,
      pendingText,
      loadingText,
      completedText,
      errorText,
      subactions
    } = config;

    let loading =
      'Deployment Results' === key ? false : currStepNum === stepNum;
    let pending = currStepNum < stepNum;
    let txHash = txHashes[key];

    let panelStyle = {
      background: 'transparent',
      borderRadius: 4,
      border: 'none',
      overflow: 'hidden'
    };

    let panelHeader = (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: '#02E2C1',
              margin: 0
            }}
          >
            <h4 style={{ color: 'black', margin: 0 }}>{stepNum}</h4>
          </div>

          <h3 style={{ margin: 0, marginLeft: 20 }}>{key}</h3>
        </div>

        <Button
          size={'small'}
          loading={loading}
          style={{
            marginRight: 34,
            borderRadius: 4,
            backgroundColor: '#02E2C1',
            color: '#171F26'
          }}
        >
          {this.props.error
            ? errorText
            : loading
              ? loadingText
              : pending
                ? pendingText
                : completedText}
        </Button>
      </div>
    );

    let panelContent =
      'Deployment Results' === key ? (
        <Row className={'panel-content-wrap'} type={'flex'} align={'middle'}>
          <Col
            style={{ paddingBottom: 20 }}
            lg={{ span: 24 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
          >
            {this.props.contract ? (
              <div id={'contract-info-wrap'}>
                <h3>{'Your contract has successfully deployed!'}</h3>

                <p>
                  {'Contract address: '}
                  <a
                    href={`${getEtherscanUrl(this.props.network)}/address/${
                      this.props.contract.address
                    }`}
                    target={'_blank'}
                  >
                    {this.props.contract.address}
                  </a>
                </p>

                <br />

                <Link to={'/contract/explorer'}>
                  <Button type={'primary'}>{'Explore All Contracts'}</Button>
                </Link>
              </div>
            ) : (
              <div>
                <h3>{'There was an error deploying your contract.'}</h3>

                <p>{this.props.error}</p>

                <div style={{ display: 'flex' }}>
                  <Button
                    id={'retry-button'}
                    type={'primary'}
                    onClick={this.onRetry.bind(this)}
                  >
                    {'Retry'}
                  </Button>

                  <div style={{ width: 20 }} />

                  <Button
                    type={'default'}
                    onClick={() => this.props.history.push('/')}
                  >
                    {'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      ) : (
        <Row className={'panel-content-wrap'} type={'flex'} align={'middle'}>
          <Col lg={{ span: 18 }} sm={{ span: 24 }} xs={{ span: 24 }}>
            <Timeline>
              {subactions.map((subaction, i) => (
                <Timeline.Item key={`subaction-${i}`} style={{ padding: 0 }}>
                  <Row>
                    <h3>{subaction.title}</h3>
                    <h4>{"What's happening?"}</h4>
                    <p>{subaction.explanation}</p>
                  </Row>
                </Timeline.Item>
              ))}

              <Timeline.Item
                dot={!txHash && <Icon type={'loading'} />}
                style={{ padding: 0 }}
              >
                <Row>
                  <h3>
                    {'Transaction Hash: '}
                    {txHash ? (
                      <a
                        href={`${getEtherscanUrl(
                          this.props.network
                        )}/tx/${txHash}`}
                        target={'_blank'}
                      >
                        {txHash}
                      </a>
                    ) : (
                      'TBD'
                    )}
                  </h3>
                </Row>
              </Timeline.Item>
            </Timeline>
          </Col>
          <Col lg={{ span: 6 }} sm={{ span: 0 }} xs={{ span: 0 }}>
            <div className={'hide-on-mobile'}>{loading && <Loader />}</div>
          </Col>
        </Row>
      );

    return (
      <Panel
        key={key}
        header={panelHeader}
        disabled={pending}
        style={panelStyle}
        showArrow
      >
        {panelContent}
      </Panel>
    );
  }

  render() {
    let { activePanelKey } = this.state;
    let collapseStyle = {
      background: '#171F26',
      border: '1px solid #02E2C1',
      borderRadius: 6,
      height: 'auto'
    };

    return (
      <Col
        style={this.props.containerStyles || {}}
        lg={{ span: 22, offset: 1 }}
        sm={{ span: 24 }}
        xs={{ span: 24 }}
      >
        <Collapse
          accordion
          activeKey={activePanelKey}
          style={collapseStyle}
          onChange={newActivePanelKey =>
            this.onChangeActivePanel(newActivePanelKey)
          }
        >
          {/* render panels */
          this.panelKeys.map((key, i) =>
            this.renderPanel(this.panelConfig[key])
          )}
        </Collapse>
      </Col>
    );
  }
}

/**
 * First step in the simplified contract.
 * [Dropdown] Select the API which user would like to use
 * [Dropdown] Select the symbol which is returned from the Binance exchangeInfo API
 *
 */
class ExchangeStep extends BaseStepComponent {
  constructor(props) {
    super(props);
    this.state = { exchangeApi: 'BIN' };
  }

  render() {
    const { form, contractName } = this.props;
    return (
      <Form
        className="step-container"
        onSubmit={this.handleSubmit.bind(this)}
        layout="vertical"
        hideRequiredMark={true}
      >
        <h1 className="text-center">Select exchange API & symbol</h1>
        <div className="step-inner-container">
          <h2>Exchange API</h2>
          <Field
            onChange={exchangeApi => this.setState({ exchangeApi })}
            name="exchangeApi"
            initialValue={this.state.exchangeApi}
            form={this.props.form}
          />
          <h2>Symbol</h2>
          <SelectTokenField
            name="tokenPair"
            form={this.props.form}
            exchange={this.state.exchangeApi}
            onSelect={this.props.updateDeploymentState}
          />
          <h2>Contract Name</h2>
          <Field
            name="contractNameSimplified"
            initialValue={contractName}
            form={form}
          />
        </div>
        <BiDirectionalNav text="View Pricing Rules" {...this.props} />
        <Link to={'/contract/deploy?mode=quick'}>
          <p className="m-top-40 m-bottom-40">View advanced deploy</p>
        </Link>
      </Form>
    );
  }
}

ExchangeStep = Form.create()(ExchangeStep);

export {
  NameContractStep,
  PricingStep,
  ExpirationStep,
  DataSourceStep,
  GasStep,
  DeployStep,
  ExchangeStep
};
