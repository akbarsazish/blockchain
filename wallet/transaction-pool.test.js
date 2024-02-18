const Transaction = require("./transaction")
const TransactionPool = require("./transaction-pool");
const Wallet = require("./index");

describe("Testing transaction pool", () => {
    let transactionPool, transaction;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        transaction = new Transaction({
           senderWallet: new Wallet(),
            recipient: "foo-recipient",
            amount: 50,
        });
    });

    describe("setTransaction()", () => {
        it("adds a transaction to the pool", () => {
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction)
        })
    });
})