const block = require('./block');
const cryptoHash = require('./crypto-hash');

class Blockchain {
    constructor(){
        this.chain = [block.genesis()];
    }

    addBlock({data}){
        const newBlock = block.mineBlock({lastBlock: this.chain[this.chain.length - 1], data});
        this.chain.push(newBlock);
    }

   static isValidChain(chain){
       if(JSON.stringify(chain[0]) !== JSON.stringify(block.genesis())){
        return false
       }

       for(let i = 1; i < chain.length; i++){
          const block = chain[i];
          const actualBlock = chain[i - 1].hash;
          const {timestamp, lastHash, hash, data} = block;
          if(lastHash !== actualBlock) return false;
          if(hash!== cryptoHash(timestamp, lastHash, data)) return false;
       }

      return true;

    }
}

module.exports = Blockchain;