import { useState } from 'react';
import { Api } from './api/Api';
import type { BankTransactionDto, LedgerTransactionDto } from './api/Api';

type ReconciliationResult = Awaited<ReturnType<Api<unknown>['api']['reconciliationReconcileCreate']>>;

const api = new Api({ baseUrl: 'http://localhost:5263' });

export default function App() {
  const [bankAmount, setBankAmount] = useState<number>(100);
  const [bankDesc, setBankDesc] = useState<string>('Test Payment');
  const [ledgerAmount, setLedgerAmount] = useState<number>(100);
  const [ledgerDesc, setLedgerDesc] = useState<string>('Test Ledger');

  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleReconcile = async () => {
    setLoading(true);
    try {
      const bankTx: BankTransactionDto = {
        date: new Date().toISOString(),
        amount: Number(bankAmount),
        description: bankDesc,
        referenceNumber: 'REF-001',
      };

      const ledgerTx: LedgerTransactionDto = {
        date: new Date().toISOString(),
        amount: Number(ledgerAmount),
        description: ledgerDesc,
        accountCode: 'ACC-100',
      };

      const data = await api.api.reconciliationReconcileCreate({
        bankTransactions: [bankTx],
        ledgerTransactions: [ledgerTx],
      });

      setResult(data);
    } catch (error) {
      console.error('Error during reconciliation:', error);
      alert('Failed to execute reconciliation');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Bank Reconciliation System</h1>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: 1 }}>
            <h3>Bank Transaction</h3>
            <label>Amount:</label><br />
            <input type="number" value={bankAmount} onChange={e => setBankAmount(Number(e.target.value))} /><br /><br />
            <label>Description:</label><br />
            <input type="text" value={bankDesc} onChange={e => setBankDesc(e.target.value)} />
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: 1 }}>
            <h3>Ledger Transaction</h3>
            <label>Amount:</label><br />
            <input type="number" value={ledgerAmount} onChange={e => setLedgerAmount(Number(e.target.value))} /><br /><br />
            <label>Description:</label><br />
            <input type="text" value={ledgerDesc} onChange={e => setLedgerDesc(e.target.value)} />
          </div>
        </div>

        <button
            onClick={handleReconcile}
            disabled={loading}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : 'Run Reconciliation'}
        </button>

        {result && (
            <div style={{ marginTop: '30px', background: '#f4f4f4', padding: '15px', borderRadius: '8px', color: '#333' }}>
              <h2>Reconciliation Result</h2>
              <p><strong>Total Bank:</strong> {result.totalBankBalance}</p>
              <p><strong>Total Ledger:</strong> {result.totalLedgerBalance}</p>
              <p><strong>Difference:</strong> {result.difference}</p>
              <p><strong>Matched Bank Count:</strong> {result.matchedBankTransactions?.length || 0}</p>
              <p><strong>Unmatched Bank Count:</strong> {result.unmatchedBankTransactions?.length || 0}</p>
            </div>
        )}
      </div>
  );
}