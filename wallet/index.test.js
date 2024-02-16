const Wallet = require('./index');
const {verifySignature} = require('./../util');

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
    });

    describe("verify signature", () => {
        const data = "signature data";
        it("verifys signature", () => {
            expect(verifySignature({
               publicKey: wallet.publicKey,
               data,
               signature: wallet.sign(data)
            })).toBe(true);
        });

        it("fails to verify signature", () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: new Wallet().sign(data)
             })).toBe(false);
        });
    })
})