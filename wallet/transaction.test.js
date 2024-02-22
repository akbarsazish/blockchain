const Transaction = require('./transaction');
const Wallet = require('./index');
const {verifySignature} = require('./../util');
const {REWARD_INPUT, MINING_REWARD } = require('./config');


describe("Transaction", () => {
    let transaction, senderWallet, recipient, amount;
    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = "recipient-address";
        amount = 100;
        transaction = new Transaction({senderWallet, recipient, amount});
    });

    it("has an `id`", () => {
        expect(transaction).toHaveProperty('id')
    })

   describe("outputMap", ()=> {
      it("has outputMap", ()=> {
          expect(transaction).toHaveProperty('outputMap')
      })

      it("output the amount to the recipient", ()=> {
        expect(transaction.outputMap[recipient]).toEqual(amount)
      })

      it("output the remaining balance to the sender", ()=> {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount)
      })
   })

   describe("input",()=>{
    it("has an input", ()=> {
          expect(transaction).toHaveProperty('input')
      });

      it("has timestamp", ()=> {
        expect(transaction.input).toHaveProperty('timestamp')
      });

      it("set the `amount` to senderwallet balance", ()=> {
        expect(transaction.input.amount).toEqual(senderWallet.balance)
      });

      it("set the `address` to sender wallet public key", ()=> {
        expect(transaction.input.address).toEqual(senderWallet.publicKey)
      });

      it("sign the input", ()=> {
        expect (verifySignature({
            publicKey: senderWallet.publicKey,
            data: transaction.outputMap,
            signature: transaction.input.signature
        }))
      })
   })

   describe("validTransaction()", () => {
     let erroMock;
     beforeEach(() => {
        erroMock = jest.fn();
         global.console.error = erroMock;
     })

    describe("when transaction is valid", () => {
        it("it return true", ()=>{
            expect(Transaction.validTransaction(transaction)).toBe(true)
        })
    })

    describe("when transaction is invalid", () => {
        describe("transaction outputMap is invalid", () => {
           it("it return false", ()=>{
                transaction.outputMap[senderWallet.publicKey] = 900000;
                expect(Transaction.validTransaction()).toBe(false)
                expect(erroMock).toHaveBeenCalled()
           })
        })
        describe("transaction input signature is invalid", () => {
           it("it return false", ()=>{
                transaction.input.signature =  new Wallet().sign('data');
                expect(Transaction.validTransaction(transaction)).toBe(false)
                expect(erroMock).toHaveBeenCalled()
           })
        })
    });


    describe("update()", ()=> {
        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        describe("and amount is invalid", ()=> {
          it("throw an error", ()=>{
            expect(() => transaction.update({senderWallet, recipient: "foo", amount: 9999999999})
            ).toThrowError("amount exceeds balance")
          })
        })
      
        describe("And amount is valid", ()=> {
          beforeEach(() => {
            originalSignature = transaction.input.signature;
             originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
             nextRecipient = "new-recipient";
             nextAmount = 100;
  
             transaction.update({senderWallet, recipient: nextRecipient, amount: nextAmount});
          })
  
          it ("output the amount to the recipient", ()=> {
            expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount)
          });
  
          it ("subtract the amount from the original sender output", ()=> {
             expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount)
          });
  
          it("maintain a total output that matches the input amount", ()=> {
            expect(Object.values(transaction.outputMap).reduce((total, outputAmount) => total + outputAmount)
              ).toEqual(transaction.input.amount)
          });
  
          it("resign the transaction", ()=> {
            expect(transaction.input.signature).not.toEqual(originalSignature)
          })

          describe("and other update for the same recipient", ()=> {
            let amount;
            beforeEach(() => {
              addedAmount = 100;
              transaction.update({senderWallet, recipient: nextRecipient, amount: addedAmount});
            });

            it("add to the recipient amount", ()=> {
              expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount)
            })

            it("subtract the amount from the original sender amount", ()=> {
              expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount - addedAmount)
            })
          })
        })
    })
   });

   describe("rewardTransaction()", ()=> {
      let rewardTransaction, minerWallet;
      beforeEach(() => {
        minerWallet = new Wallet();
        rewardTransaction = Transaction.rewardTransaction({minerWallet});
      })

      it("create transaction with reward input", () => {
        expect(rewardTransaction.input).toEqual(REWARD_INPUT)
      })

      it("create transaction with `MINER_REWARD` output", () => {
        expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD)
      })
   })
})