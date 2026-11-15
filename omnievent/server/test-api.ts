async function runTests() {
  const base = 'http://localhost:3001/api';

  console.log('--- 1. Testing /health ---');
  const hRes = await fetch(`${base}/health`);
  const hData = await hRes.json();
  console.log('Health:', hData.status, hData.ethicalStandards);

  console.log('\n--- 2. Testing /ethics/privacy-report ---');
  const pRes = await fetch(`${base}/ethics/privacy-report`);
  const pData = await pRes.json();
  console.log('Privacy Compliance:', pData.data.status, pData.data.frameworks.map((f: any) => f.name));

  console.log('\n--- 3. Testing /audit-ledger/verify ---');
  const aRes = await fetch(`${base}/audit-ledger/verify`);
  const aData = await aRes.json();
  console.log('Ledger Status:', aData.status, 'Total Checked:', aData.data.checkedEntries);

  console.log('\n--- 4. Testing /incidents/inc1/solve ---');
  const sRes = await fetch(`${base}/incidents/inc1/solve`, { method: 'POST' });
  const sData = await sRes.json();
  console.log('Generated Options:', sData.data.recoveryOptions.length, sData.data.recoveryOptions.map((o: any) => o.planName));

  console.log('\n--- 5. Testing Human-in-the-Loop Rejection without signature ---');
  const rRes = await fetch(`${base}/incidents/inc1/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  console.log('Rejected Status (should be 403):', rRes.status);

  console.log('\n--- 6. Testing Human-in-the-Loop Approval with signature ---');
  const appRes = await fetch(`${base}/incidents/inc1/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: 'opt-inc1-plan-a',
      newRoomId: 'r2',
      humanSignature: {
        organizerId: 'org_sarah_coo',
        organizerName: 'Sarah Jenkins (COO)',
        role: 'human_organizer',
        rationale: 'Grand Hall B has matching dual-4K laser projection and preserves step-free wheelchair access for all 423 attendees.',
      },
    }),
  });
  const appData = await appRes.json();
  console.log('Approval Status:', appRes.status, appData.message);

  console.log('\n--- 7. Re-verifying Cryptographic Audit Ledger after commit ---');
  const vRes = await fetch(`${base}/audit-ledger/verify`);
  const vData = await vRes.json();
  console.log('Chain Valid:', vData.data.isValid, 'Total Blocks in Mini-Blockchain:', vData.data.checkedEntries);
}

runTests().catch(console.error);

