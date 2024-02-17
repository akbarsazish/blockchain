const {v1} = require('uuid');
const {verifySignature} = require('./../util');

class Transaction {
    constructor({senderWallet, recipient, amount}) {
        this.id = v1();
        this.outputMap = this.createOutputMap({senderWallet, recipient, amount});
        this.input = this.createInput({senderWallet, outputMap: this.outputMap});
    }

    createOutputMap ({senderWallet, recipient, amount}) {
        const outputMap = {};
        outputMap[recipient] = amount,
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    createInput ({senderWallet, outputMap}) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        }
    }

    static validTransaction(transaction) {
        if (!transaction) {
            console.error("Invalid transaction: Transaction object is undefined.");
            return false;
        }
    
        const { outputMap, input: { address, amount, signature } } = transaction;
        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount);
        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}: Output total does not match transaction amount.`);
            return false;
        }
    
        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid signature from ${address}.`);
            return false;
        }
    
        return true;
    }
    
    
}


module.exports = Transaction;