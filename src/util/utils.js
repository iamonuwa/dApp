import { message } from 'antd';
import store from '../store';
import abi from 'human-standard-token-abi';

/**
 *
 * @param priceFloor
 * @param priceCap
 * @param qtyMultiplier
 * @param qty
 * @param price
 * @return {number}
 */
export const calculateCollateral = function(
  priceFloor,
  priceCap,
  qtyMultiplier,
  qty,
  price
) {
  const zero = 0;
  let maxLoss;
  if (qty > zero) {
    if (price <= priceFloor) {
      maxLoss = zero;
    } else {
      maxLoss = price - priceFloor;
    }
  } else {
    if (price >= priceCap) {
      maxLoss = zero;
    } else {
      maxLoss = priceCap - price;
    }
  }
  return maxLoss * Math.abs(qty) * qtyMultiplier;
};

// TODO(perfectmak): This should be moves to a more cohesive helper package
export async function processContractsList(
  marketContract,
  marketCollateralPool,
  collateralToken,
  ERC20,
  deployedContracts
) {
  let promises = deployedContracts.map(async contract => {
    return await marketContract
      .at(contract)
      .then(async function(instance) {
        return await instance.MARKET_COLLATERAL_POOL_ADDRESS.call().then(
          async address => {
            if (address !== '0x0000000000000000000000000000000000000000') {
              const contractJSON = {};
              contractJSON['key'] = instance.address;
              contractJSON[
                'CONTRACT_NAME'
              ] = await instance.CONTRACT_NAME.call();

              const collateralTokenContractAddress = await instance.COLLATERAL_TOKEN_ADDRESS.call();
              contractJSON[
                'COLLATERAL_TOKEN_ADDRESS'
              ] = collateralTokenContractAddress;

              await collateralToken
                .at(collateralTokenContractAddress)
                .then(async function(collateralTokenInstance) {
                  contractJSON[
                    'COLLATERAL_TOKEN'
                  ] = await collateralTokenInstance.name();
                  contractJSON[
                    'COLLATERAL_TOKEN_SYMBOL'
                  ] = await collateralTokenInstance.symbol();
                })
                .catch(function(err) {
                  try {
                    const token = contract(ERC20).at(
                      collateralTokenContractAddress
                    );
                    contractJSON['COLLATERAL_TOKEN'] = token.name();
                    contractJSON['COLLATERAL_TOKEN_SYMBOL'] = token.symbol();
                  } catch (e) {
                    console.error(e);
                    contractJSON['COLLATERAL_TOKEN'] = 'NA';
                    contractJSON['COLLATERAL_TOKEN_SYMBOL'] = 'NA';
                  }
                });

              contractJSON[
                'PRICE_FLOOR'
              ] = await instance.PRICE_FLOOR.call().then(data =>
                data.toNumber()
              );
              contractJSON['PRICE_CAP'] = await instance.PRICE_CAP.call().then(
                data => data.toNumber()
              );
              contractJSON[
                'PRICE_DECIMAL_PLACES'
              ] = await instance.PRICE_DECIMAL_PLACES.call().then(data =>
                data.toNumber()
              );

              contractJSON['MARKET_COLLATERAL_POOL_ADDRESS'] = address;

              contractJSON[
                'QTY_MULTIPLIER'
              ] = await instance.QTY_MULTIPLIER.call().then(data =>
                data.toNumber()
              );
              contractJSON['ORACLE_QUERY'] = await instance.ORACLE_QUERY.call();
              contractJSON[
                'EXPIRATION'
              ] = await instance.EXPIRATION.call().then(data =>
                data.toNumber()
              );
              contractJSON['lastPrice'] = await instance.lastPrice
                .call()
                .then(data => data.toNumber());
              contractJSON['isSettled'] = await instance.isSettled.call();

              // TODO: There is a possibility a contract ends up in our registry that wasn't linked to a collateral pool
              // correctly.  The code below will handle this, but a better solution would probably to not actually
              // display contracts that are not correctly linked to a collateral pool!
              await marketCollateralPool
                .at(await address)
                .then(async function(collateralPoolInstance) {
                  contractJSON[
                    'collateralPoolBalance'
                  ] = await collateralPoolInstance.collateralPoolBalance
                    .call()
                    .then(data => data.toNumber());
                })
                .catch(function(err) {
                  console.error(err);
                  contractJSON['collateralPoolBalance'] = 'NA';
                });

              return contractJSON;
            }
          }
        );
      })
      .catch(function(err) {
        console.error(err);
      });
  });

  return await Promise.all(promises);
}

/**
 * Convert MetaMask error message to dApp error message.
 * Fallback: return original message.
 *
 * @param errorMessage
 * @return getMetamaskError
 */
export const getMetamaskError = function(errorMessage) {
  if (errorMessage.indexOf('User denied transaction') !== -1)
    return 'User denied transaction';
  else return errorMessage;
};

export const getLocationOrigin = () => window.location.origin;

/**
 * Detect if network belongs to testnet/mainnet
 *
 * @param network
 * @return boolean true/false
 */
export const isTestnetOrMainnet = network => {
  return network !== 'truffle' && network !== 'unknown';
};

/**
 * Get an ERC20 Token Balance
 *
 * @param tokenAddress
 * @param toString
 * @param callback function for returning response from the web3 callback
 * @return BigNumber or String balance of users metamask address
 */
export const getTokenBalance = (tokenAddress, toString, callback) => {
  let web3 = store.getState().web3.web3Instance;

  let contractInstance = web3.eth.contract(abi).at(tokenAddress);

  return contractInstance.balanceOf.call(web3.eth.coinbase, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      switch (toString) {
        case true:
          const availableCollateral = web3
            .fromWei(res.toFixed(), 'ether')
            .toString();

          return callback(availableCollateral);
        default:
          return callback(res);
      }
    }
  });
};

/**
 * Convert String to ERC20 Token Base Unit
 *
 * @param value
 * @param decimals
 * @return BigNumber String
 */
export const toBaseUnit = (value, decimals) => {
  return value * 10 ** decimals;
};

/**
 * Convert BigNumber String to Number
 *
 * @param value
 * @param decimals
 * @return Number
 */
export const fromBaseUnit = (value, decimals) => {
  return value / 10 ** decimals;
};

/** get Etherscan Url for correct Ethereum Network
 *
 * @param networkId(string)
 * return baseUrl
 */
export const getEtherscanUrl = networkId => {
  switch (networkId) {
    case 'mainnet':
      return 'https://etherscan.io';
    case 'morden':
      return 'https://morden.etherscan.io';
    case 'ropsten':
      return 'https://ropsten.etherscan.io';
    case 'rinkeby':
      return 'https://rinkeby.etherscan.io';
    case 'kovan':
      return 'https://kovan.etherscan.io';
    default:
      return '';
  }
};

/**
 * Set `collateralTokenAddress` based on the `network`
 *
 * `0x01b8de20c76ed06c7e93068a45951c26f70be3db` -- Web3.eth
 * `0x0c58e89866dda96911a78dedf069a1848618c185` -- Stable USD
 *
 * @param network
 * @param quoteAsset
 * @return collateralTokenAddress
 */
export const getCollateralTokenAddress = (network, quoteAsset) => {
  if (network === 'rinkeby') {
    switch (quoteAsset) {
      case 'ETH':
        return '0x2021c394e8fce5e56c166601a0428e4611147802';
      case 'WETH':
        return '0xc778417e063141139fce010982780140aa0cd5ab';
      case 'USDT':
      case 'USD':
        return '0xee78ae82ab0bbbae6d99b36a999e7b6de2e8664b';
      default:
        return '';
    }
  }

  return '';
};

/**
 * reads .json truffle artifacts
 * @param {string} contract
 * @param {number} networkId of the web3 network
 * @return {string}
 */
export const getContractAddress = (contract, networkId) => {
  // TODO: Throw an error in case the contract doesn't have network specific address
  return contract.networks[networkId].address;
};

/**
 * Copies supplied text to the clipboard
 * @param {string} text
 */
export const copyTextToClipboard = text => {
  let textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    message.success('Copied successfully to clipboard');
  } catch (err) {
    console.log('Unable to copy the contract address to clipboard');
  }
  document.body.removeChild(textArea);
};
