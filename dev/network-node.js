const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');
const requestPromise = require('request-promise');


const PORT = process.argv[2];
const DEFAULT_PORT = 3000;

const Blockchain = require('./blockchain');

const nodeAddress = uuid().split('-').join('');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const blockchain = new Blockchain()

app.get('/blockchain', (req, res) => {
    
    res.json(blockchain);
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

app.post('/register-and-broadcast-node', (req, res) => {
    const newNodeUrl = req.body.nodeUrl;
    if (blockchain.networkNodes.indexOf(newNodeUrl) === -1) blockchain.networkNodes.push(newNodeUrl);

    const requestPromises = [];
    blockchain.networkNodes.forEach(nodeUrl => {
        if(nodeUrl !== newNodeUrl){
            const requestOptions = {
                uri: `${nodeUrl}/register-node`,
                method: 'POST',
                body: {nodeUrl: newNodeUrl},
                json: true
            };
            requestPromises.push(requestPromise(requestOptions));
        }
        
    });

    Promise.all(requestPromises)
    .then(data => {
        const bulkRegisterOptions = {
            uri: `${newNodeUrl}/register-nodes-bulk`,
            method: 'POST',
            body: { 
                networkNodes: [ ...blockchain.networkNodes, blockchain.currentNodeUrl ]
            },
            json: true
        }
        return requestPromise(bulkRegisterOptions)
    })
    .then(data => {
        res.json({note: 'node has successfully been registered in the network'});
    })
    .catch(err => {console.error(err)});

});

app.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.nodeUrl;
    const nodeDoesnotExist = blockchain.networkNodes.indexOf(newNodeUrl) === -1;
    const notCurrentNode = newNodeUrl !== blockchain.currentNodeUrl;
    if (nodeDoesnotExist && notCurrentNode) blockchain.networkNodes.push(newNodeUrl);
    res.json({note: 'Node has successfully been registered'});
});

app.post('/register-nodes-bulk', (req, res) => {
    const networkNodes = [ ...req.body.networkNodes ];
    networkNodes
    .filter(node => blockchain.networkNodes.indexOf(node) === -1)
    .filter(node => node !== blockchain.currentNodeUrl)
    .forEach(node => blockchain.networkNodes.push(node));
    res.json({note: 'Bulk has successfully been registered'});
});

app.listen(PORT || DEFAULT_PORT, () => {
    console.log(`Listening on port ${PORT || DEFAULT_PORT}...`)
});