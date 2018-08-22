const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');

const Blockchain = require('./blockchain');

const nodeAddress = uuid().split('-').join('');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const blockchain = new Blockchain()

app.get('/blockchain', (req, res) => {
    
    res.json(blockchain.chain);
});

app.get('/mine', (req, res) => {
    
    const lastBlock = blockchain.getLastBlock();

    const prevHash = lastBlock.hash;
    const current = {
        transactions: blockchain.pendingTransactions,
        index: lastBlock.index + 1,
    };
    const nonce = blockchain.getNonce();
    const hash = blockchain.hashBlock(prevHash, current, nonce);
    
    blockchain.createNewTransaction(12.5, '00', nodeAddress);

    const block = blockchain.createNewBlock(nonce, prevHash, hash);
    
    res.json(block);
});

app.post('/transaction', (req, res) => {
    const transaction = req.body;
    const blockIndex = blockchain.createNewTransaction(transaction.amount, transaction.sender, transaction.recipient);
    if(blockIndex === blockchain.getLastBlock()['index'] + 1){
        res.json({msg: `Transaction will be added to the next block id: ${blockIndex}`});
    }
    else{
        res.json({error: `Transaction will not be saved into the blockchain system`});
    }
    
});

app.listen(3000, () => {
    console.log('Listening on port 3000...')
});