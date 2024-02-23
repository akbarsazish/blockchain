const Block = require('./block');
const Blockchain = require('./index');
const {cryptoHash} = require('./../util');
const Wallet = require('./../wallet');
const Transaction = require('./../wallet/transaction');

describe("Blockchain", () => {
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
        errorMock = jest.fn();
        global.console.error = errorMock;
    })

    it ("containe `chain` array instance", () => {
        expect(blockchain.chain instanceof Array).toBe(true)
    })

    it("it start with genesis block", () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    })

    it("it add new blcok to the chain", () => {
        const newDat = 'new data';
        blockchain.addBlock({data: newDat});
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newDat)
    })

    describe("isValidChain()", () => {
        describe("when chain does not start with genesis block", () => {
            it("it returns false", () => {
                blockchain.chain[0] = {data:'fake-genesis-block'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
            })
        });

        describe("when chain start with genesis block", () => {

            beforeEach(() => {
                blockchain.addBlock({data: 'one'});
                blockchain.addBlock({data: 'two'});
                blockchain.addBlock({data: 'three'});
            })

            describe("last hash reference has changed", () => {
                it("it returns false", () => {
                    blockchain.chain[2].lastHash = 'fake-hash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            });

            describe("the chain has invalid faild", () => {
                it("it returns false", () => {
                    blockchain.chain[2].data = 'changed-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            })

            describe("chain does not have invalid faild", () => {
                it("it returns false", () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
                })
            });

            describe("when chain has contain with jumped difficulty", () => {
                it("return false", () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = []
                    const difficulty = lastBlock.difficulty + 3;

                    const hash = cryptoHash(timestamp, lastHash, data, difficulty, nonce);
                    const badBlock = new Block({
                        timestamp,
                        lastHash,
                        hash,
                        data,
                        difficulty,
                        nonce
                    });

                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            })
        })
    });




    describe("replaceChain()", () => {
        let logMock;
        beforeEach(()=> {
            logMock = jest.fn();
            global.console.log = logMock;
        })

        describe("when the new chain is not longer than the current chain", () => {
            beforeEach(() => {
                newChain[0] = {new: 'new chain'};
                blockchain.replaceChain(newChain.chain);
            })
            

            it("it does not replace the chain", () => {
                expect(blockchain.chain).toEqual(originalChain) 
            });

            it("logs an error", () => {
                expect(errorMock).toHaveBeenCalled();
            })
        });

        describe("when the new chain is longer than the current chain", () => {
            beforeEach(() => {
                newChain.addBlock({data: 'one'});
                newChain.addBlock({data: 'two'});
                newChain.addBlock({data: 'three'});
              });

            describe("when the new chain is not valid", () => {

                beforeEach(()=>{
                    newChain.chain[2].hash = 'fake-hash';
                    blockchain.replaceChain(newChain.chain);
                  })

                it("it does not replace the chain", () => {
                    expect(blockchain.chain).toEqual(originalChain)
                });

                it("logs an error", () => {
                    expect(errorMock).toHaveBeenCalled();
                })
            });

            describe("when the new chain is valid", () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                })
                
                it("it replace the chain", () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it("logs an error", () => {
                    expect(logMock).toHaveBeenCalled();
                })
            });
        });
        describe('and the `validateTransactions` flag is true', ()=>{
            it('calss validTransactionData', ()=>{
              const validTransactionDataMock = jest.fn();
              blockchain.validTransactionData = validTransactionDataMock;
              newChain.addBlock({data: 'foo'});
              blockchain.replaceChain(newChain.chain, true);
              expect(validTransactionDataMock).toHaveBeenCalled();
            })
          });

        describe('and the validateTransaction flag is true', ()=>{
            it('calls validTransactionData()', ()=>{
                const validTransactionDataMock = jest.fn();
                blockchain.validTransactionData = validTransactionDataMock;
                newChain.addBlock({data: 'foo'});
                blockchain.replaceChain(newChain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            })
        })
    });

    describe('validTransactionData()', ()=>{
        let transaction, rewardTransaction, wallet;
    
        beforeEach(()=>{
          wallet = new Wallet();
          transaction = wallet.createTransaction({recipient: 'foo-recipient', amount: 65});
          rewardTransaction = Transaction.rewardTransaction({minerWallet: wallet});
        });
    
        describe('and the transaction data is valid', ()=>{
          it('returns true', ()=>{
            newChain.addBlock({data: [transaction, rewardTransaction]});
            expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(true);
          })
        });
    
        describe('and the tranaction data has multiple rewards', ()=>{
          it('returns false and logs an error', ()=>{
            newChain.addBlock({data: [transaction, rewardTransaction, rewardTransaction]});
            expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
            expect(errorMock).toHaveBeenCalled();
          });
        });
    
        describe('and the transaction data has at least one malformed `outputMap`', ()=>{
          describe('and the transaction is not a reward transaction', ()=>{
            it('returns false and logs an error', ()=>{
              transaction.outputMap[wallet.publicKey] = 99999;
              newChain.addBlock({data: [transaction, rewardTransaction]});
            expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
            expect(errorMock).toHaveBeenCalled();
            });
          });
    
          describe('and the transaction is  a reward transaction', ()=>{
            it('returns false and logs an error', ()=>{
              rewardTransaction.outputMap[wallet.publicKey] = 99999;
              newChain.addBlock({data: [transaction, rewardTransaction]});
              console.log('------>', rewardTransaction);
            expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
            expect(errorMock).toHaveBeenCalled();
            });
          });
        });
    
        describe('and the transaction data has at least one malformed `input`', ()=>{
          it('returns false and logs an error', ()=>{
            wallet.balance = 9000;
    
            const evilOutputMap ={
              fooRecipient: 100,
              [wallet.publicKey] : 8900
            }
    
            const evilTransaction = {
              input: {
                timestamp: Date.now(),
                amount: wallet.balance,
                address: wallet.publicKey,
                signature: wallet.sign(evilOutputMap)
              },
              outputMap: evilOutputMap
            }
    
            newChain.addBlock({data: [evilTransaction, rewardTransaction]});
            expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
            expect(errorMock).toHaveBeenCalled();
            
          });
        });
    
        describe('and a block contains multiple identical transactions', ()=>{
            it('returns false and logs an error', ()=>{
              newChain.addBlock({data: [transaction,transaction, rewardTransaction]});
              expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false);
              expect(errorMock).toHaveBeenCalled();
            });
          });
      })
  
})