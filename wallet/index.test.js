const Wallet = require('./index');
const {verifySignature} = require('./../util');
const Transaction = require('./transaction');

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
    });

    describe("create transaction", () => {
        describe("and the amount exceeds the balance", () => {
            it("throws an error", () => {
              expect(() =>
                wallet.createTransaction({
                  amount: 999999,
                  recipient: "foo-recipient",
                })
              ).toThrow("amount exceeds balance");
            });
          });

        describe("amount is valid", () => {
            let transaction, amount, recipient;
            beforeEach(() => {
                amount = 100;
                recipient = "recipient-address";
                transaction = wallet.createTransaction({amount, recipient});
            })

            it("create instance of `Transaction`", () => {
               expect(transaction instanceof Transaction).toBe(true);
            })

            it("match the transaction input with wallet balance", () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            })

            it("show the amount to the recipient", () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        })
    })
})