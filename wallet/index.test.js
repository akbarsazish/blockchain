const Wallet = require('./index');

describe("Testing wallet code", () => {
    let wallet;
    beforeEach(() => {
        wallet = new Wallet();
    });

    it("has a `balance`", () => {
        expect(wallet).toHaveProperty('balance')
    })
    
    it("has a `publicKey`", () => {
        console.log(wallet.publicKey);
        expect(wallet).toHaveProperty('publicKey')
    })
})