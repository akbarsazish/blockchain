const Blockchain = require('./blockchain');
const blockchain = new Blockchain();
blockchain.addBlock({data: 'first block'});

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for(let i = 0; i < 1000; i++){
    prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;
    blockchain.addBlock({data: `block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length - 1];
    nextTimestamp = nextBlock.timestamp;
    timeDiff = nextTimestamp - prevTimestamp;
    times.push(timeDiff);
    average = times.reduce((acc, val) => acc + val, 0) / times.length;
    console.log(`Block #${i} took ${timeDiff}ms to mine. Average time: ${average}ms`);
}

