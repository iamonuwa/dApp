const MathLib = artifacts.require(
  '@marketprotocol/marketprotocol/MathLib.sol'
);
const OrderLib = artifacts.require(
  '@marketprotocol/marketprotocol/OrderLib.sol'
);
const QueryTest = artifacts.require(
  '@marketprotocol/marketprotocol/OraclizeQueryTest.sol'
);
const CollateralToken = artifacts.require(
  '@marketprotocol/marketprotocol/InitialAllocationCollateralToken.sol'
);
const MarketContractOraclize = artifacts.require(
  '@marketprotocol/marketprotocol/MarketContractOraclize.sol'
);
const MarketContractFactory = artifacts.require(
  '@marketprotocol/marketprotocol/MarketContractFactoryOraclize.sol'
);
const MarketCollateralPoolFactory = artifacts.require(
  '@marketprotocol/marketprotocol/MarketCollateralPoolFactory.sol'
);
const MarketContractRegistry = artifacts.require(
  '@marketprotocol/marketprotocol/MarketContractRegistry.sol'
);
const MarketToken = artifacts.require(
  '@marketprotocol/marketprotocol/MarketToken.sol'
);

module.exports = function(deployer, network) {
  if (network !== 'live') {
    deployer.deploy(MathLib);
    deployer.deploy(OrderLib);
    deployer.deploy(MarketContractRegistry).then(function() {
      deployer.link(
        MathLib,
        QueryTest,
        MarketContractOraclize,
        MarketContractFactory
      );

      deployer.link(
        MathLib,
        MarketCollateralPoolFactory
      );

      deployer.link(OrderLib, MarketContractFactory, MarketContractOraclize);
      // deploy our quest test contract
      deployer.deploy(QueryTest).then(function(queryTestInstance) {
        // by forcing the first query when we deploy we can make sure all the prices are accurate since
        // the first query is free with oraclize.
        return queryTestInstance.testOracleQuery(
          'URL',
          'json(https://api.kraken.com/0/public/Ticker?pair=BCHUSD).result.BCHUSD.c.0',
          { from: web3.eth.accounts[0] }
        );
      });

      // deploy MKT token
      const marketTokenToLockForTrading = 0; // for testing purposes, require no lock
      const marketTokenAmountForContractCreation = 0; //for testing purposes require no balance
      return deployer
        .deploy(
          MarketToken,
          marketTokenToLockForTrading,
          marketTokenAmountForContractCreation
        )
        .then(function() {
          // deploy collateral token and a fake wrapped ETH
          deployer.deploy(CollateralToken, 'Stable USD', 'USD', 1e9, 18);
          deployer.deploy(CollateralToken, 'Fake Wrapped ETH', 'FWETH', 1e9, 18);

          const daysToExpiration = 28;
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + daysToExpiration);

          // deploy and set up main factory to create MARKET Protocol smart contracts.
          return MarketContractRegistry.deployed().then(function(
            marketContractRegistry
          ) {

            return deployer.deploy(
              MarketCollateralPoolFactory,
              marketContractRegistry.address
            ).then(function(collateralPoolFactory)
            {
              return deployer
                .deploy(
                  MarketContractFactory,
                  marketContractRegistry.address,
                  MarketToken.address,
                  collateralPoolFactory.address,
                  {
                    gas: web3.eth.getBlock('latest').gasLimit,
                    from: web3.eth.accounts[0]
                  }
                )
                .then(function(factory) {
                  // white list the factory
                  return marketContractRegistry
                    .addFactoryAddress(factory.address)
                    .then(function() {
                      // deploy a single contract for testing purposes.
                      const gasLimit = 4000000; // gas limit for contract deployment
                      let quickExpirationTimeStamp =
                        Math.floor(Date.now() / 1000) + 60 * 60; // expires in an hour
                      return factory
                        .deployMarketContractOraclize(
                          'ETHUSD_' + new Date().toISOString().substring(0, 10),
                          CollateralToken.address,
                          [50000, 150000, 2, 1e18, quickExpirationTimeStamp],
                          'URL',
                          'json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0',
                          { gas: gasLimit, from: web3.eth.accounts[0] }
                        )
                        .then(function(marketContractDeployResults) {
                          const marketContractDeployedAddress =
                            marketContractDeployResults.logs[0].args
                              .contractAddress;
                          return collateralPoolFactory.deployMarketCollateralPool(
                              marketContractDeployedAddress,
                              { gas: 1900000 }
                            );
                        });
                    });
                });
            });
          });
        });
    });
  }
};
