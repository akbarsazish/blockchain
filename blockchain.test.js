const Block = require('./block');
const Blockchain = require('./blockchain');

describe("Testing blockchain code", () => {
    let blockchain, newChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
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
            })
        })
    });

    describe("replaceChain()", () => {

    });

  
})