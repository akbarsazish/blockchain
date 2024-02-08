
const Block = require('./block');
const {GENESIS_DATA} = require('./config');
const cryptoHash = require('./crypto-hash');

describe("Testing block code", () => {
    const timestamp = '123456';
    const lastHash = 'foo-hash';
    const hash = "hash";
    const data = ["abc", "abcd", "blockchain"];
    const difficulty = 1;
    const nonce = 1;

    const block = new Block({
        timestamp,
        lastHash,
        hash,
        data,
        difficulty,
        nonce
    })

    it("has a timestamp, lastHash, hash and data property", ()=>{
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.difficulty).toEqual(difficulty);
        expect(block.nonce).toEqual(nonce);
    });

    describe("genesis()", () => {
        const genesisblock = Block.genesis();
        it("it returns instance of block", () => {
            expect(genesisblock instanceof Block).toEqual(true)
        })
        it("it return genesis static method", () => {
            expect(genesisblock).toEqual(GENESIS_DATA)
        })
    })


    describe('mineBlock()', ()=>{
        const lastBlock = Block.genesis()
   
        const data = 'min-block-data';
        const minedBlock = Block.mineBlock({lastBlock, data});

        it('returns an instance of Block', () => {
            expect(minedBlock instanceof Block).toEqual(true);
        });

        it('sets the last hash to the hash of the lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the data to the data passed in', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets the `timestamp`', ()=>{
            expect(minedBlock.timestamp).not.toEqual(undefined);
          });

        it("sets the `hash`", () => {
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    minedBlock.timestamp,
                    minedBlock.difficulty,
                    minedBlock.nonce,
                    lastBlock.hash,
                    data
                ));
        });

        it("sets the `difficulty`", () => {
            expect(minedBlock.hash.substr(0, minedBlock.difficulty)).toEqual("0".repeat(minedBlock.difficulty));
        });
    });
})

