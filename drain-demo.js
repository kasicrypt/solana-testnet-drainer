// DRAIN DEMO - RENDER VERSION
const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3002;

const NETWORK = 'https://api.testnet.solana.com';
const connection = new solanaWeb3.Connection(NETWORK, 'confirmed');

app.get('/', async (req, res) => {
    let output = [];
    function log(msg) { output.push(msg); console.log(msg); }
    
    try {
        log('💀 TOKEN DRAIN DEMONSTRATION');
        log('===========================\n');
        
        log('📱 HOW A REAL DRAINER WORKS:\n');
        log('1️⃣ Victim sees "free tokens" in their Phantom wallet');
        log('2️⃣ Victim clicks "Swap via Jupiter"');
        log('3️⃣ Transaction looks normal: "Swap 100 tokens"');
        log('4️⃣ BUT hidden in the same transaction:');
        log('   • Approve drainer for ALL USDC');
        log('   • Approve drainer for ALL SOL');
        log('   • Grant unlimited access\n');
        
        // Check if wallet exists
        if (!fs.existsSync('/tmp/wallet.json')) {
            log('❌ No wallet found. Run create-malicious-token.js first!');
            res.send(output.join('<br>'));
            return;
        }
        
        const privateKey = JSON.parse(fs.readFileSync('/tmp/wallet.json', 'utf-8'));
        const wallet = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(privateKey));
        
        // Test USDC on testnet
        const usdcMint = new solanaWeb3.PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
        
        try {
            const usdcAccount = await splToken.getOrCreateAssociatedTokenAccount(
                connection,
                wallet,
                usdcMint,
                wallet.publicKey
            );
            
            log(`\n💰 USDC Account: ${usdcAccount.address.toString()}`);
            log('\n🔐 SIMULATING HIDDEN APPROVAL:');
            log('   (This is what victim DOES NOT see)');
            
            // Simulate approval
            await splToken.approve(
                connection,
                wallet,
                usdcAccount.address,
                wallet.publicKey,
                wallet.publicKey,
                Number.MAX_SAFE_INTEGER
            );
            
            log('✅ UNLIMITED APPROVAL GRANTED TO DRAINER!');
            log('\n💸 DRAINER CAN NOW:');
            log('   • Transfer ALL USDC anytime');
            log('   • No more victim approval needed');
            log('   • Victim never knows until too late');
            
        } catch (error) {
            log(`\nℹ️  Note: ${error.message}`);
            log('   (This is normal if you have no test USDC)');
        }
        
    } catch (error) {
        log(`❌ Error: ${error.message}`);
    }
    
    res.send(output.join('<br>'));
});

app.listen(PORT, () => {
    console.log(`Demo running on port ${PORT}`);
});
