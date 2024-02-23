const Wallet = require('./index');
const {verifySignature} = require('./../util');
const Transaction = require('./transaction');
const Blockchain = require('./../blockchain');
const { STARTING_BALANCE } = require('../config');

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
        });

        describe("and a chain is passed", () => {
          it("calls `wallet.calculateBalance`", () => {
            const calculateBalanceMock = jest.fn();
            const originalCalculateBalance = Wallet.calculateBalance;
            Wallet.calculateBalance = calculateBalanceMock;
    
            wallet.createTransaction({
              recipient: "foo",
              amount: 10,
              chain: new Blockchain().chain,
            });
    
            expect(calculateBalanceMock).toHaveBeenCalled();
            Wallet.calculateBalance = originalCalculateBalance;
          });
        });

        
    })

    describe('calculateBalance()', ()=>{
        let blockchain;
    
        beforeEach(()=>{
          blockchain = new Blockchain();
        });
    
        describe('and there are no outputs for the wallet',()=>{
          it('returns the `STARTING_BALANCE`', ()=>{
            expect(Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey
            })).toEqual(STARTING_BALANCE)
          })
        })
    
        describe('and there are outputs for the wallet', ()=>{
          let transactionOne, transactionTwo;
    
          beforeEach(()=>{
            transactionOne = new Wallet().createTransaction({
              recipient: wallet.publicKey,
              amount: 50
            });
    
            transactionTwo = new Wallet().createTransaction({
              recipient: wallet.publicKey,
              amount: 60
            });
    
            blockchain.addBlock({data: [transactionOne, transactionTwo]})
          })
    
          it('adds the sum of all outputs to the wallet balnace', ()=>{
            expect(
              Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey
            })).toEqual(STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey])
          })

          describe('and there are outputs next to and after the recent transaction', ()=>{
            let sameBlockTransaction, nextBlockTransaction;
  
            beforeEach(()=>{
              recentTransaction = wallet.createTransaction({
                recipient: 'later-foo-address',
                amount: 60
              });
  
              sameBlockTransaction = Transaction.rewardTransaction({minerWallet: wallet});
  
              blockchain.addBlock({data: [recentTransaction, sameBlockTransaction]});
              nextBlockTransaction = new Wallet().createTransaction({
                recipient: wallet.publicKey, amount: 75
              });
  
              blockchain.addBlock({data: [nextBlockTransaction]});
            });
  
            it('inculdes the output amount s in the returned balance', ()=>{
              expect(Wallet.calculateBalance({
                chain: blockchain.chain,
                address: wallet.publicKey
              })).toEqual(
                recentTransaction.outputMap[wallet.publicKey] +
                sameBlockTransaction.outputMap[wallet.publicKey] +
                nextBlockTransaction.outputMap[wallet.publicKey]
              )
            })
          });
          
        });
      })
})