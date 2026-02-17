// SOLANA TESTNET TOKEN CREATOR - RENDER VERSION
const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const splToken2022 = require('@solana/spl-token-2022');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// TESTNET ONLY
const NETWORK = 'https://api.testnet.solana.com';

app.get('/', async (req, res) => {
    let output = [];
    function log(msg) { output.push(msg); console.log(msg); }
    
    try {
        log('⚠️  SOLANA TESTNET TOKEN CREATOR');
        log('================================\n');
        
        // Connect to testnet
        const connection = new solanaWeb3.Connection(NETWORK, 'confirmed');
        
        // Generate new wallet
        log('🔑 Generating new wallet...');
        const wallet = solanaWeb3.Keypair.generate();
        
        log('\n📋 YOUR WALLET ADDRESS:');
        log('==================================');
        log(wallet.publicKey.toString());
        log('==================================');
        log('\n⏳ This wallet needs testnet SOL.');
        log('👉 Go to: https://solfaucet.com');
        log('👉 Paste this address');
        log('👉 Complete captcha');
        log('👉 Click "Send me SOL"');
        log('👉 DO THIS 3 TIMES');
        log('\n⚠️  After getting SOL, refresh this page!');
        
        // Save wallet for next steps
        fs.writeFileSync('/tmp/wallet.json', JSON.stringify(Array.from(wallet.secretKey)));
        fs.writeFileSync('/tmp/wallet-address.txt', wallet.publicKey.toString());
        
        // Check if we have SOL
        const balance = await connection.getBalance(wallet.publicKey);
        if (balance > 0) {
            log(`\n💰 Balance: ${balance / 1e9} SOL - Good to continue!`);
            
            // Create malicious token
            log('\n🎣 Creating malicious token...');
            const tokenMint = solanaWeb3.Keypair.generate();
            
            const mint = await splToken2022.createMint(
                connection,
                wallet,
                wallet.publicKey,
                wallet.publicKey,
                9,
                tokenMint
            );
            
            // Create token account
            const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
                connection,
                wallet,
                mint,
                wallet.publicKey
            );
            
            // Mint 1000 tokens
            await splToken.mintTo(
                connection,
                wallet,
                mint,
                tokenAccount.address,
                wallet,
                1000 * 1e9
            );
            
            log('\n✅ SUCCESS!');
            log('📝 TOKEN ADDRESS (COPY THIS):');
            log('==================================');
            log(mint.toBase58());
            log('==================================');
            log('\n👉 Import this address to Phantom Wallet (Testnet)');
            log('👉 You should see "Jupiter Airdrop" with 1000 tokens');
            
            // Save token address
            fs.writeFileSync('/tmp/token-address.txt', mint.toBase58());
        }
        
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
    
    res.send(output.join('<br>'));
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});
