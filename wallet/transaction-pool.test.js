const TrasactionPool = require("./transaction-pool");
const Transaction = require("./transaction");
const Wallet = require("./index");

describe("TransactionPool", () => {
  let transactionPool, transaction, senderWallet;

  beforeEach(() => {
    senderWallet = new Wallet();
    transactionPool = new TrasactionPool();
    transaction = new Transaction({
      senderWallet: senderWallet,
      recipient: "test-recipient",
      amount: 50,
    });
  });

  describe("setTransaction()", () => {
    it("adds a transaction", () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });

  describe("existingTransaction()", () => {
    it("returns an existing transaction given an input address", () => {
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.existingTransaction({
          inputAddress: senderWallet.publicKey,
        })
      ).toBe(transaction);
    });
  });

  describe("validTransactions()", () => {
    let validTrnsactions, errorMock;

    beforeEach(()=>{
      validTrnsactions = [];
      errorMock = jest.fn();
      global.console.error = errorMock;
      for(let i=0; i<10; i++){
        transaction = new Transaction({
          senderWallet, recipient: 'any-recipient', amount: 30
        });

        if(i%3 === 0){
          transaction.input.amount = 99999;
        }else if(i%3 === 1){
          transaction.input.signature = new Wallet().sign('foo');
        }else{
          validTrnsactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }
    });

    it('returns valid transactions', ()=>{
      expect(transactionPool.validTransaction()).toEqual(validTrnsactions);
    });
  });
 
});
