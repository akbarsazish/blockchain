const Block = require('./block');
const Blockchain = require('./index');
const {cryptoHash} = require('./../util');

describe("Testing blockchain code", () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
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
        let erroMock, logMock;
        beforeEach(()=> {
            erroMock = jest.fn();
            logMock = jest.fn();
            global.console.error = erroMock;
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
                expect(erroMock).toHaveBeenCalled();
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
                    expect(erroMock).toHaveBeenCalled();
                })
            });

            describe("when the new chain is valid", () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                })
                
                it("it replace the chain", () => {
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it("logs an error", () => {
                    expect(logMock).toHaveBeenCalled();
                })
            });

        });
    });
  
})