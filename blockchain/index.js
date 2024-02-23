const block = require('./block');
const {cryptoHash} = require('./../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('./../wallet/transaction');

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
 
    replaceChain(chain, onSuccess){
      if(chain.length <= this.chain.length){
        console.error('Received chain is not longer than current chain. Do nothing');
        return;
      }
      if(!Blockchain.isValidChain(chain)){
        console.error('Received chain is not valid. Do nothing');
        return
      }
      if(onSuccess) onSuccess();
      console.log('Received chain is valid. Replacing current chain with', chain);
      this.chain = chain;
    }

    validTransactionData({chain}){
      for(let i = 1; i < chain.length; i++){
        const block = chain[i];
        let rewardTrasactionCount = 0;
        
        for(let transaction of block.data){
          if(transaction.input.address === REWARD_INPUT.address){
            rewardTrasactionCount += 1;
            if(rewardTrasactionCount > 1){
               console.error('Reward transaction count is greater than 1');
               return false;
            }
            if(Object.values(transaction.outputMap)[0]!== MINING_REWARD){
              console.error('Reward transaction value is invalid');
               return false;
            }
          }else{
            if(!Transaction.validTransaction(transaction)){
              console.error('invalid transaction');
              return false;
          }
        }
      }
    }
    return true;
  }
}

module.exports = Blockchain;