// MONITORING BOT - RENDER VERSION
const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

const NETWORK = 'https://api.testnet.solana.com';
const connection = new solanaWeb3.Connection(NETWORK, 'confirmed');

app.get('/', async (req, res) => {
    let output = [];
    function log(msg) { output.push(msg); console.log(msg); }
    
    try {
        log('🔍 MONITORING BOT - TESTNET');
        log('==========================\n');
        
        // Check if wallet exists
        if (!fs.existsSync('/tmp/wallet.json')) {
            log('❌ No wallet found. Run create-malicious-token.js first!');
            res.send(output.join('<br>'));
            return;
        }
        
        const privateKey = JSON.parse(fs.readFileSync('/tmp/wallet.json', 'utf-8'));
        const wallet = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(privateKey));
        
        log(`👀 Watching wallet: ${wallet.publicKey.toString()}\n`);
        
        // Get all token accounts
        const accounts = await connection.getTokenAccountsByOwner(
            wallet.publicKey,
            { programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
        );
        
        log(`📊 Found ${accounts.value.length} token accounts:\n`);
        
        for (let i = 0; i < accounts.value.length; i++) {
            const acc = accounts.value[i];
            const info = await splToken.getAccount(connection, acc.pubkey);
            
            log(`Account ${i+1}:`);
            log(`  Address: ${acc.pubkey.toString()}`);
            log(`  Mint: ${info.mint.toString()}`);
            log(`  Balance: ${info.amount.toString()}`);
            
            if (info.delegate) {
                log(`  ⚠️  DELEGATE FOUND: ${info.delegate.toString()}`);
                log(`  ⚠️  Delegated amount: ${info.delegatedAmount.toString()}`);
            }
            log('');
        }
        
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
    
    res.send(output.join('<br>'));
});

app.listen(PORT, () => {
    console.log(`Bot running on port ${PORT}`);
});
