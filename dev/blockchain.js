const hash = require('sha256');
class Blockchain{
    constructor(){
        this.chain = [];
        this.pendingTransactions = [];
        this.createNewBlock(-1, hash('3620'), hash('0304'));
    }

    createNewBlock(nonce, previousBlockHash, hash) {
        const newBlock = new Block(
            this.chain.length + 1, 
            this.pendingTransactions, 
            nonce, 
            hash, 
            previousBlockHash
        );

        this.pendingTransactions = [];
        this.chain.push(newBlock);
        return newBlock;
    }

    getLastBlock (){
        return this.chain[this.chain.length - 1];
    }

    createNewTransaction(amount, sender, recipient) {
        const newTransaction = new Transaction(amount, sender, recipient);
        this.pendingTransactions.push(newTransaction);
        return this.getLastBlock() ? this.getLastBlock()['index'] + 1 : 1;
    }

    hashBlock(previousBlockHash, currentBlockData, nonce){
        const dataAsString = '' + previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData)
        return hash(dataAsString);
    }

    proofOfWork(previousBlockHash, currentBlockData){
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash,currentBlockData, nonce);

        while(hash.substring(0,4) !== '0000'){
            nonce++;
            hash = this.hashBlock(previousBlockHash,currentBlockData, nonce);
        }
        return nonce;
    }
}

class Block {
    constructor(index, transactions, nonce, hash, previousBlockHash){
        this.index = index;
        this.timestamp = Date.now(),
        this.transactions = transactions;
        this.nonce = parseInt(''+nonce, 10);
        this.hash = hash;
        this.previousBlockHash = previousBlockHash;
    }
}

class Transaction{
    constructor(amount, sender, recipient){
        this.amount = parseFloat(''+amount);
        this.sender = sender;
        this.recipient = recipient;
    }
}

module.exports = Blockchain;