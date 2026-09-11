import { useState, ChangeEvent, DragEvent } from 'react';
import { Api } from './api/Api';
import type { BankTransactionDto, LedgerTransactionDto } from './api/Api';

type ReconciliationResult = Awaited<ReturnType<Api<unknown>['api']['reconciliationReconcileCreate']>>;

const api = new Api({ baseUrl: 'http://localhost:5263' });

export default function App() {
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [ledgerFile, setLedgerFile] = useState<File | null>(null);

  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDropBank = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setBankFile(e.dataTransfer.files[0]);
    }
  };

  const handleDropLedger = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setLedgerFile(e.dataTransfer.files[0]);
    }
  };
  
  const parseBankCsv = async (file: File): Promise<BankTransactionDto[]> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).slice(1).filter(line => line.trim());

    return lines.map(line => {
      const [rawDate, rawAmount, description, refNum] = line.split(',');

      const parsedDate = new Date(rawDate?.trim());
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      const parsedAmount = parseFloat(rawAmount?.trim()) || 0;

      return {
        date: validDate.toISOString(),
        amount: parsedAmount,
        description: description?.trim() || 'No description',
        referenceNumber: refNum?.trim() || 'REF-UNKNOWN'
      };
    });
  };

  const parseLedgerCsv = async (file: File): Promise<LedgerTransactionDto[]> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).slice(1).filter(line => line.trim());

    return lines.map(line => {
      const [rawDate, rawAmount, description, accCode] = line.split(',');

      const parsedDate = new Date(rawDate?.trim());
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      const parsedAmount = parseFloat(rawAmount?.trim()) || 0;

      return {
        date: validDate.toISOString(),
        amount: parsedAmount,
        description: description?.trim() || 'No description',
        accountCode: accCode?.trim() || 'ACC-UNKNOWN'
      };
    });
  };

  const handleReconcile = async () => {
    if (!bankFile || !ledgerFile) {
      alert('Please choose 2 CSV files!');
      return;
    }

    setLoading(true);
    try {
      const bankTransactions = await parseBankCsv(bankFile);
      const ledgerTransactions = await parseLedgerCsv(ledgerFile);

      const data = await api.api.reconciliationReconcileCreate({
        bankTransactions,
        ledgerTransactions,
      });

      setResult(data);
    } catch (error) {
      console.error('Reconciliation error:', error);
      alert('Could not complete the reconciliation');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>Reconciliation</h2>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div
              onDragOver={handleDragOver}
              onDrop={handleDropBank}
              style={{ flex: 1, border: '2px dashed #4A90E2', padding: '30px 20px', borderRadius: '8px', textAlign: 'center', background: '#F4F7FB', cursor: 'pointer' }}
          >
            <h3>Bank's file (CSV)</h3>
            <input
                type="file"
                accept=".csv"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBankFile(e.target.files?.[0] || null)}
            />
            {bankFile && <p style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>✓ {bankFile.name}</p>}
          </div>
          
          <div
              onDragOver={handleDragOver}
              onDrop={handleDropLedger}
              style={{ flex: 1, border: '2px dashed #4A90E2', padding: '30px 20px', borderRadius: '8px', textAlign: 'center', background: '#F4F7FB', cursor: 'pointer' }}
          >
            <h3>Ledger (CSV)</h3>
            <input
                type="file"
                accept=".csv"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLedgerFile(e.target.files?.[0] || null)}
            />
            {ledgerFile && <p style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>✓ {ledgerFile.name}</p>}
          </div>
        </div>

        <button
            onClick={handleReconcile}
            disabled={loading || !bankFile || !ledgerFile}
            style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#28A745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : 'Start reconciliation'}
        </button>

        {/* Вывод результатов */}
        {result && (
            <div style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ padding: '15px', background: '#e9ecef', borderRadius: '6px', flex: 1 }}>Total Bank: <strong>{result.totalBankBalance}</strong></div>
                <div style={{ padding: '15px', background: '#e9ecef', borderRadius: '6px', flex: 1 }}>Total Ledger: <strong>{result.totalLedgerBalance}</strong></div>
                <div style={{ padding: '15px', background: result.difference !== 0 ? '#f8d7da' : '#d4edda', borderRadius: '6px', flex: 1 }}>Difference: <strong>{result.difference}</strong></div>
              </div>

              <h3>Results</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                <tr style={{ background: '#f1f3f5', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Description / Ref</th>
                  <th style={{ padding: '12px' }}>Bank Amount</th>
                  <th style={{ padding: '12px' }}>Ledger Amount</th>
                </tr>
                </thead>
                <tbody>
                {result.matchedBankTransactions?.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #eee', background: '#e6f4ea' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: '#ceead6', color: '#0d652d', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Match</span>
                      </td>
                      <td style={{ padding: '12px' }}>{tx.description} ({tx.referenceNumber})</td>
                      <td style={{ padding: '12px' }}>{tx.amount}</td>
                      <td style={{ padding: '12px' }}>{tx.amount}</td>
                    </tr>
                ))}

                {result.unmatchedBankTransactions?.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #eee', background: '#fce8e6' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: '#fad2cf', color: '#c5221f', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Only in Bank</span>
                      </td>
                      <td style={{ padding: '12px' }}>{tx.description} ({tx.referenceNumber})</td>
                      <td style={{ padding: '12px' }}>{tx.amount}</td>
                      <td style={{ padding: '12px' }}>-</td>
                    </tr>
                ))}

                {result.unmatchedLedgerTransactions?.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #eee', background: '#fce8e6' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: '#fad2cf', color: '#c5221f', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Only in Ledger</span>
                      </td>
                      <td style={{ padding: '12px' }}>{tx.description} ({tx.accountCode})</td>
                      <td style={{ padding: '12px' }}>-</td>
                      <td style={{ padding: '12px' }}>{tx.amount}</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
}