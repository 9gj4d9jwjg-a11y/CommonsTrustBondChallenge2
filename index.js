const xrpl = require('xrpl');
const crypto = require('crypto'); // For hashing evidence

async function main() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const ngoWallet = xrpl.Wallet.fromSeed('YOUR_NGO_SEED_HERE');

  // Example evidence (e.g., hash of a PDF)
  const evidenceData = 'Project report content or image data';
  const evidenceHash = crypto.createHash('sha256').update(evidenceData).digest('hex');

  // Register evidence via payment transaction with memo
  const evidenceTx = await client.submitAndWait({
    TransactionType: 'Payment',
    Account: ngoWallet.address,
    Amount: '0', // Zero XRP for self-transaction (memo only)
    Destination: ngoWallet.address,
    Memos: [{
      Memo: {
        MemoData: Buffer.from(evidenceHash).toString('hex'),
        MemoType: Buffer.from('evidence').toString('hex'),
        MemoFormat: Buffer.from('text/plain').toString('hex')
      }
    }]
  }, { wallet: ngoWallet });
  console.log('Evidence registered:', evidenceTx);

  // Fetch and visualize (simple console dashboard)
  const accountTx = await client.request({
    command: 'account_tx',
    account: ngoWallet.address,
    limit: 10
  });
  console.log('Recent transactions (dashboard):', accountTx.result.transactions);

  await client.disconnect();
}

main().catch(console.error);
