var express = require('express');
var router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function runCompletion (strategy, takeloss, takeprofit, typetrade) {
  var content = `give me only the script on Java for ${strategy} with a take loss of ${takeloss} and a take profit of ${takeprofit} using ${typetrade}`
  const completion = await openai.createCompletion({
  model: "text-davinci-003",
  prompt: "Hello How you doing?",
  max_tokens:4000
  });
  //console.log(completion.data.choices[0].text);
  return completion.data.choices[0].text;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/sent', async function(req, res, next) {
  const strategy = req.body.strategy;
  const minbudget = req.body.minbudget;
  const maxbudget = req.body.maxbudget;
  const typetrade = req.body.typetrade;
  const respond = await runCompletion(strategy,minbudget,maxbudget,typetrade);
  res.render('index',{msg: "SUCCES!", Respond:respond});
});

router.post('/execute-code', async function(req, res, next) {
  const code = req.body.code;
  try {
    // Evaluate the code using eval()
    const result = eval(code);
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

module.exports = router;
