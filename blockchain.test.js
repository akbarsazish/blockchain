const Block = require('./block');
const Blockchain = require('./blockchain');

describe("Testing blockchain code", () => {
    const blockchain = new Blockchain();

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
})