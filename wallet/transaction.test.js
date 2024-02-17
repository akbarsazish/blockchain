const Transaction = require('./transaction');
const Wallet = require('./index');
const {verifySignature} = require('./../util');


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
    })
   })
})