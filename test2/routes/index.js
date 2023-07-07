let express = require('express');
let router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
  
});

const openai = new OpenAIApi(configuration);

async function runCompletion (broker, instrument, leverage, entry, exit, risk) {
  let strategy = 
  ` I want to make a trading bot working live on my trading account with ${broker}.
  The trading bot will trade on the ${instrument} market. It is important to note
  that I am using ${leverage} leverage. 
  Here is my entry strategy : 
  ${entry}
  Here is my exit strategy : 
  ${exit}
  Here is the risk I am willing to take on each trade : 
  ${risk}
  Generate the complete code in javascript that implement my strategy with the
  information i have given you. The code should be working once I have provided
  the API key from my account.
  Make sure to place stop loss according to the risk management on each order and
  to have a method runBot.
  Implement all the logics.`
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: strategy,
    max_tokens:8000
   });
  return completion.data.choices[0].text;
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
  const risk = (req.body.risk)=== null ? req.body.risk : "3% risk on margin";
  const respond = await runCompletion(broker, instrument, leverage, entry, exit, risk);
  res.render('index', {msg: "SUCCES!", Respond:respond});
});

// router.post('/execute-code', async function(req, res, next) {
//   const code = req.body.code;
//   try {
//     // Evaluate the code using eval()
//     const result = eval(code);
//     res.status(200).json({ result });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// })

module.exports = router;
