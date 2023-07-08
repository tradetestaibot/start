//const axios = require('axios');
//const backtrader = require('backtrader');
//const pinejs = require('pinejs');


const express = require('express');
const router = express.Router();

const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY});
const openai = new OpenAIApi(configuration);

// class TradingStrategy extends backtrader.Strategy {
//   constructor(testBot) {
//     super();
//     this.testBot = testBot;
//   }

//   init() {
//     const javascriptCode = pinejs.transpile(this.pinescriptCode);
//     eval(javascriptCode);
//   }

//   next() {
//     // Add your additional trading strategy logic here
//     // You can access the OHLC data using `this.data`
//     // Example: const currentPrice = this.data.close[0];
//   }
// }

// async function runBackTest() {
//   // Create a new instance of cerebro
//   const cerebro = new backtrader.Cerebro();

//   // Set the desired initial capital for the backtest
//   cerebro.broker.setcash(10000); // Replace with your desired initial capital

//   // Add your strategy to cerebro
//   const pinescriptCode = `
//     //@version=4
//     strategy("My Strategy", overlay=true)
//     // Rest of your Pinescript code
//   `;
//   const myStrategy = new MyStrategy(pinescriptCode);
//   cerebro.addstrategy(myStrategy);

//   // Add your data feed to cerebro
//   const data = new backtrader.feeds.YourDataFeed(); // Replace with your specific data feed
//   cerebro.adddata(data);

//   // Run the backtest
//   cerebro.run();

//   // Access the performance metrics and results
//   const strategy = cerebro.strategies[0];
//   const returns = strategy.broker.getvalue();
//   console.log('Returns:', returns);
// }

// async function fetchHistoricalData(symbol) {
//   const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
//   const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;
//   try {
//     const response = await axios.get(apiUrl);
//     const timeSeriesData = response.data['Time Series (Daily)'];
    
//     // Parse the response and convert it into an array of OHLC data
//     const historicalData = Object.entries(timeSeriesData).map(([date, data]) => {
//       return [
//         new Date(date).getTime(),
//         parseFloat(data['1. open']),
//         parseFloat(data['2. high']),
//         parseFloat(data['3. low']),
//         parseFloat(data['4. close']),
//         parseInt(data['5. volume'])
//       ];
//     });
//     return historicalData;
//   } catch (error) {
//     console.error('Error fetching historical data:', error);
//     throw error;
//   }
// }

function extractCodeTestBot(response) {
  const codeRegex = /```pinescript([\s\S]*)```/;
  const match = response.match(codeRegex);
  return match ? match[1].trim() : '';
}

function extractCodeBot(response) {
  const codeRegex = /```javascript([\s\S]*)```/;
  const match = response.match(codeRegex);
  return match ? match[1].trim() : '';
}

async function createBackTestBot(entry, exit) {
  let strategy = 
  ` Generate a pinescript strategy working in TradingView on the that follows:
    entry strategy: ${entry}
    exit strategy: ${exit}`
  const prompt = [
    { role: "system", content: "You are a helpful assistant that provides code snippets."},
    { role: "user", content: strategy }
  ];
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k-0613",
    messages: prompt,
    max_tokens: 16000,
    temperature: 0.8
   });
   return extractCodeTestBot(completion.data.choices[0].message.content);
}

async function createRealBot(broker, instrument, leverage, risk, testBot) {
  let strategy = 
  ` ${testBot}
    Transform this strategy to a fully automated trading bots that will run in a infinite loop 
    and execute orders on ${broker} using my API key with binance on ${instrument} with a leverage
    of ${leverage} and a risk of ${risk} my whole wallet in javascript.`
  const prompt = [
    { role: "system", content: "You are a helpful assistant that provides code snippets."},
    { role: "user", content: strategy }
  ];
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k-0613",
    messages: prompt,
    max_tokens: 16000,
    temperature: 0.8
   });
   return extractCodeBot(completion.data.choices[0].message.content);
}

async function generateCodes(broker, instrument, leverage, entry, exit, risk){
  const testBot = await createBackTestBot(entry, exit);
  const realBot = await createRealBot(broker, instrument, leverage, risk, testBot);
  return {testBot: testBot, realBot: realBot};
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/sent', async function(req, res, next) {
  const broker = req.body.broker;
  const instrument = req.body.instrument;
  const leverage = req.body.leverage;
  const entry = req.body.entry;
  const exit = req.body.exit;
  const risk = (req.body.risk) === null ? req.body.risk : "3% risk on margin";
  const strategyResult = await generateCodes(broker, instrument, leverage, entry, exit, risk);
  res.render('index', {msg: "SUCCES!", testBot: strategyResult.testBot, realBot: strategyResult.realBot});
});

module.exports = router;
