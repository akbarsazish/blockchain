const cryptoHash = require('./crypto-hash');

describe("crypto()", () => {
    it("it generates a hash", () => {
        expect(cryptoHash("foo")).toEqual("2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae")
    })
    
    it("it produce the same hash for the same input", () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'))
    })
})