const block = require('./block');
const {cryptoHash} = require('./../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('./../wallet/transaction');
const Wallet = require('../wallet');

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
 
    replaceChain(chain, validTansactions, onSuccess){
      if(chain.length <= this.chain.length){
        console.error('Received chain is not longer than current chain. Do nothing');
        return;
      }
      if(!Blockchain.isValidChain(chain)){
        console.error('Received chain is not valid. Do nothing');
        return
      }
      if(validTansactions && !this.validTransactionData({chain})){
        console.error('the incoming chain has invalid data');
        return;
      }
      if(onSuccess) onSuccess();
      console.log('Received chain is valid. Replacing current chain with', chain);
      this.chain = chain;
    }

    validTransactionData({chain}){
      for(let i=1; i<chain.length; i++){
        const block = chain[i];
        const transactionSet = new Set();
        let rewardTransactionCount = 0;
  
        for(let transaction of block.data){
          if(transaction.input.address === REWARD_INPUT.address){
            rewardTransactionCount +=1;
            if(rewardTransactionCount > 1){
              console.error('Miner reward exceed limit');
              return false;
            }
            if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
              console.error('Miner reward is invalid');
              return false
            }
          }else{
            if(!Transaction.validTransaction(transaction)){
              console.error('invalid transaction');
              return false;
            }
            const trueBalnace = Wallet.calculateBalance({
              chain: this.chain,
              address: transaction.input.address
            });
  
            if(transaction.input.amount !== trueBalnace){
              console.error('Invalid input amount');
              return false;
            }
            if(transactionSet.has(transaction)){
              console.error('an identical transaction appears more than one in the block');
              return false;
            }else{
              transactionSet.add(transaction);
            }
          }
        }
      }
  
      return true;
    } 
}

module.exports = Blockchain;