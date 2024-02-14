const express = require('express');
const Blockchain = require('./blockchain');
const Pubsub = require('./pubsub');
const tcpPortUsed = require('tcp-port-used');
const axios = require('axios');

const app = express();
app.use(express.json());

const blockchain = new Blockchain();
const pubsub = new Pubsub({blockchain});

// setTimeout(() => {
//     pubsub.broadcastChain();
// }, 1000);

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
})

app.post('/api/min', (req, res) => {
    const {data} = req.body;
    blockchain.addBlock({data});
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
})

const rootPort = 8080;
let PORT = 8080;


const asynChain = async() => {
    const response = await axios.get(`http://localhost:${rootPort}/api/blocks`);
    blockchain.replaceChain(response.data);
}


tcpPortUsed.check(PORT, '127.0.0.1').then(inUse => {
    if (inUse) {
        PORT +=  Math.ceil(Math.random() * 1000);
    }
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    if(rootPort!== PORT) {
        asynChain();
    }
});

