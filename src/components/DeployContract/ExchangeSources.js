import { EMPTY, zip } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';

const ExchangeSources = [
  {
    key: 'BIN',
    name: 'Binance',
    genOracleQuery(symbol) {
      return `json(https://api.binance.com/api/v3/ticker/price?symbol=${
        symbol.symbol
      }).price`;
    },
    fetchList(quotes) {
      const info = ajax({
        url: 'https://api.marketprotocol.io/proxy/binance/api/v1/exchangeInfo',
        method: 'GET',
        responseType: 'json'
      }).pipe(
        map(data =>
          data.response.symbols.filter(
            symbol => quotes.indexOf(symbol.quoteAsset) >= 0
          )
        )
      );

      const price = ajax({
        url: 'https://api.marketprotocol.io/proxy/binance/api/v3/ticker/price',
        method: 'GET',
        responseType: 'json'
      }).pipe(map(data => data.response));

      return zip(info, price, function(infoItem, priceItem) {
        const prices = {};
        const symbols = [];
        priceItem.forEach(e => {
          prices[e.symbol] = e.price;
        });
        infoItem.forEach(e => {
          symbols.push({
            symbol: e.symbol,
            price: prices[e.symbol],
            priceDecimalPlaces: e.baseAssetPrecision,
            quoteAsset: e.quoteAsset
          });
        });
        return symbols;
      });
    }
  },
  {
    key: 'BIT',
    name: 'Bitfinex',
    genOracleQuery(symbol) {
      return `json(https://api.bitfinex.com/v1/pubticker/${
        symbol.symbol
      }).last_price`;
    },
    getPrice(symbol) {
      return ajax({
        url: `https://api.marketprotocol.io/proxy/bitfinex/v1/pubticker/${symbol}`,
        method: 'GET',
        responseType: 'json'
      }).pipe(map(data => data.response.last_price));
    },
    fetchList(quotes) {
      return ajax({
        url: `https://api.marketprotocol.io/proxy/bitfinex/v1/symbols_details`,
        method: 'GET',
        responseType: 'json'
      }).pipe(
        map(data =>
          data.response
            .filter(symbol => {
              if (symbol.pair.endsWith('eth')) symbol.quoteAsset = 'ETH';
              if (symbol.pair.endsWith('usd')) symbol.quoteAsset = 'USDT';
              return quotes.indexOf(symbol.quoteAsset) >= 0;
            })
            .map(e => ({
              symbol: e.pair.toUpperCase(),
              priceDecimalPlaces: e.price_precision,
              quoteAsset: e.quoteAsset
            }))
        )
      );
    }
  },
  {
    key: 'KRA',
    name: 'Kraken (coming soon...)',
    genOracleQuery(symbol) {
      return `json(https://api.kraken.com/0/public/Ticker?pair=${symbol}).result.${symbol}.p.1`;
    },
    fetchList() {
      return EMPTY;
    }
  }
];

export function getExchangeObj(source) {
  return ExchangeSources.filter(sourceObj => source === sourceObj.key)[0];
}

export default ExchangeSources;
