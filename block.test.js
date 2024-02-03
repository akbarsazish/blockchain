const Block = require('./block')

describe("Testing block code", ()=>{
     timeStamp = "23123213";
     lastHash = "lastHash";
     hash = "hash";
     data = ["abc", "abcd", "love"];

     const block = new Block({
        timeStamp,
        lastHash,
        hash,
        data
     })

    it("has timeStamp, lasHash, hash, data", ()=> {
        expect(block.timeStamp).toEqual(timeStamp)
        expect(block.lastHash).toEqual(lastHash)
        expect(block.hash).toEqual(hash)
        expect(block.data).toEqual(data)
    })

    describe("genesis()", ()=>{
        const genesisblock = Block.genesis();
        it("it returns instance of block", ()=> {
            expect(genesisblock instanceof Block).toEqual(true)
        })
        it("it return genesis static method", ()=> {
            expect(genesisblock).toEqual(GENESIS_DATA)
        })
    })
    describe("minedBlock", ()=>{
       const minedBlock = ge
    })
})

233588648