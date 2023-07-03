function VWAPReboundStrategy(openPrice, highPrice, lowPrice, lastPrice) { 
    let longTrigger = (openPrice + highPrice) / 2; 
    let shortTrigger = (openPrice + lowPrice) / 2;
     let longSignal, shortSignal; 
     if(lastPrice > longTrigger) { longSignal = 'Buy'; } 
     if(lastPrice < shortTrigger) { shortSignal = 'Sell'; } 
     if(longSignal !== undefined || shortSignal !== undefined) { return {longSignal, shortSignal}; } 
     else { return 'No Signal'; } } const signal = VWAPReboundStrategy(4,17,1,10); signal; // {longSignal: 'Buy'}
