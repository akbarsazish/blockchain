const block = require('./block');
const {cryptoHash} = require('./../util');

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
          const lastDifficulty = chain[i - 1].difficulty;
          const {timestamp, lastHash, hash, data, difficulty, nonce} = block;
          if(lastHash !== actualBlock) return false;
          if(Math.abs(lastDifficulty - difficulty) > 1) return false;
          if(hash!== cryptoHash(timestamp, lastHash, data, difficulty, nonce)) return false;
       }

      return true;
    }
 
    replaceChain(chain){
      if(chain.length <= this.chain.length){
        console.error('Received chain is not longer than current chain. Do nothing');
        return;
      }
      if(!Blockchain.isValidChain(chain)){
        console.error('Received chain is not valid. Do nothing');
        return
      }
      console.log('Received chain is valid. Replacing current chain with', chain);
      this.chain = chain;
    }
}

module.exports = Blockchain;