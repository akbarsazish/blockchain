const cryptoHash = require('./crypto-hash');

describe("crypto()", () => {
    it("it generates a hash", () => {
        expect(cryptoHash("foo")).toEqual("b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b")
    })
    
    it("it produce the same hash for the same input", () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'))
    })
})