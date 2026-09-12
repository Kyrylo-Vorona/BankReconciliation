import { useState, ChangeEvent, DragEvent, useEffect } from 'react';
import { Api } from './api/Api';
import type { BankTransactionDto, LedgerTransactionDto } from './api/Api';

type ReconciliationResult = Awaited<ReturnType<Api<unknown>['api']['reconciliationReconcileCreate']>>;

type HistoryItem = {
  id: string;
  createdAt: string;
  totalBankBalance: number;
  totalLedgerBalance: number;
  difference: number;
};

const api = new Api({ baseUrl: 'http://localhost:5263' });

export default function App() {
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [ledgerFile, setLedgerFile] = useState<File | null>(null);

  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');

  const [showAdjustmentsForm, setShowAdjustmentsForm] = useState<boolean>(false);
  
  const [adjustments, setAdjustments] = useState<AdjustmentEntry[]>([]);
  const [adjAccount, setAdjAccount] = useState('');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjDescription, setAdjDescription] = useState('');

  const fetchHistory = async () => {
    try {
      const data = await api.api.reconciliationHistoryList({ format: 'json' } as any);

      console.log('History fetched successfully:', data);
      setHistoryList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistoryList([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (result?.adjustments) {
      setAdjustments(result.adjustments);
    } else {
      setAdjustments([]);
    }
    setShowAdjustmentsForm(false);
  }, [result]);

  const handleAddAdjustmentRow = () => {
    if (!adjAccount || !adjAmount) {
      alert('Please specify Account Code and Amount');
      return;
    }
    setAdjustments([
      ...adjustments,
      {
        accountCode: adjAccount,
        amount: parseFloat(adjAmount) || 0,
        description: adjDescription,
      },
    ]);
    setAdjAccount('');
    setAdjAmount('');
    setAdjDescription('');
  };

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
  
  const parseAmount = (rawAmount: string | undefined): number => {
    if (!rawAmount) return 0;

    let cleaned = rawAmount.trim();
    
    cleaned = cleaned.replace(/["'\s]/g, '');
    
    if (cleaned.includes('.') && cleaned.includes(',')) {
      if (cleaned.lastIndexOf('.') > cleaned.lastIndexOf(',')) {
        cleaned = cleaned.replace(/,/g, '');
      } else {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      }
    } else {
      cleaned = cleaned.replace(',', '.');
    }

    const result = parseFloat(cleaned);
    return isNaN(result) ? 0 : result;
  };
  
  const splitCsvLine = (line: string): string[] => {
    const semicolonCount = (line.match(/;/g) || []).length;
    const commaCount = (line.match(/,/g) || []).length;

    const delimiter = semicolonCount > commaCount ? ';' : ',';
    return line.split(delimiter);
  };

  const parseBankCsv = async (file: File): Promise<BankTransactionDto[]> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).slice(1).filter(line => line.trim());

    return lines.map(line => {
      const columns = splitCsvLine(line);
      const [rawDate, rawAmount, description, refNum] = columns;

      const parsedDate = new Date(rawDate?.trim());
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      return {
        date: validDate.toISOString(),
        amount: parseAmount(rawAmount),
        description: description?.trim().replace(/^"|"$/g, '') || 'No description',
        referenceNumber: refNum?.trim().replace(/^"|"$/g, '') || 'REF-UNKNOWN'
      };
    });
  };

  const parseLedgerCsv = async (file: File): Promise<LedgerTransactionDto[]> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).slice(1).filter(line => line.trim());

    return lines.map(line => {
      const columns = splitCsvLine(line);
      const [rawDate, rawAmount, description, accCode] = columns;

      const parsedDate = new Date(rawDate?.trim());
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      return {
        date: validDate.toISOString(),
        amount: parseAmount(rawAmount),
        description: description?.trim().replace(/^"|"$/g, '') || 'No description',
        accountCode: accCode?.trim().replace(/^"|"$/g, '') || 'ACC-UNKNOWN'
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
      setSelectedHistoryId('');
      setBankFile(null);
      setLedgerFile(null);
      fetchHistory();
    } catch (error) {
      console.error('Reconciliation error:', error);
      alert('Could not complete the reconciliation');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedHistoryId(id);

    if (!id) {
      setResult(null);
      return;
    }

    setBankFile(null);
    setLedgerFile(null);

    setLoading(true);
    try {
      const data = await api.api.reconciliationHistoryDetail(id, { format: 'json' } as any);
      setResult(data);
    } catch (error) {
      console.error('Error fetching reconciliation details:', error);
      alert('Failed to load selected reconciliation details.');
    } finally {
      setLoading(false);
    }
  };

  const downloadExportReport = (result: ReconciliationResult) => {
    if (!result) return;

    const rows: (string | number)[][] = [];

    const formatCsvRow = (arr: (string | number)[]): string => {
      return arr
          .map((val) => {
            if (val === null || val === undefined) return '""';

            let str = String(val);
            if (typeof val === 'number') {
              str = str.replace('.', ',');
            }

            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(';');
    };

    rows.push(['Reconciliation Report', '']);
    rows.push(['Reconciliation Date', result.createdAt ? new Date(result.createdAt).toLocaleString().replace(',', '') : 'N/A']);
    rows.push(['Report Generated At', new Date().toLocaleString().replace(',', '')]);
    rows.push([]);
    rows.push(['Total Bank Balance', result.totalBankBalance ?? 0]);
    rows.push(['Total Ledger Balance', result.totalLedgerBalance ?? 0]);
    rows.push(['Difference', result.difference ?? 0]);
    rows.push([]);
    rows.push(['Status', 'Date', 'Description / Ref', 'Bank Amount', 'Ledger Amount']);

    const matchedBank = result.matchedBankTransactions || [];
    const matchedLedger = result.matchedLedgerTransactions || [];
    const ledgerMap = new Map(matchedLedger.map((item) => [item.id, item]));

    matchedBank.forEach((bankTx) => {
      const ledgerTx = bankTx.matchedLedgerTransactionId
          ? ledgerMap.get(bankTx.matchedLedgerTransactionId)
          : matchedLedger.find(l => l.amount === bankTx.amount);

      rows.push([
        'Matched',
        bankTx.date ? new Date(bankTx.date).toLocaleDateString() : '',
        bankTx.description || bankTx.referenceNumber || '',
        bankTx.amount ?? 0,
        ledgerTx?.amount ?? bankTx.amount ?? 0,
      ]);
    });

    (result.unmatchedBankTransactions || []).forEach((bankTx) => {
      rows.push([
        'Unmatched (Bank Only)',
        bankTx.date ? new Date(bankTx.date).toLocaleDateString() : '',
        bankTx.description || bankTx.referenceNumber || '',
        bankTx.amount ?? 0,
        '-',
      ]);
    });

    (result.unmatchedLedgerTransactions || []).forEach((ledgerTx) => {
      rows.push([
        'Unmatched (Ledger Only)',
        ledgerTx.date ? new Date(ledgerTx.date).toLocaleDateString() : '',
        ledgerTx.description || ledgerTx.accountCode || '',
        '-',
        ledgerTx.amount ?? 0,
      ]);
    });

    const csvContent = 'sep=;\n' + rows.map(formatCsvRow).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reconciliation_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAndDownloadCsv = async () => {
    const targetId = selectedHistoryId || result?.id;
    if (!targetId) return;

    try {
      const response = await fetch(`http://localhost:5263/api/reconciliation/history/${targetId}/adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustments),
      });

      if (!response.ok) {
        alert('Failed to save adjustments');
        return;
      }
      
      const rows = [
        ['Date', 'Account Code', 'Amount', 'Description'],
        ...adjustments.map(adj => [
          new Date().toLocaleString(),
          adj.accountCode,
          adj.amount,
          adj.description
        ])
      ];

      const csvContent = 'sep=,\n' + rows.map(e => e.map(val => `"${val}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `adjustments_report_${targetId.slice(0, 8)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      fetchHistory();

    } catch (error) {
      console.error('Error:', error);
      alert('Could not complete operation');
    }
  };

  return (
      <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>Reconciliation</h2>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label htmlFor="history-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>
            Load past reconciliation:
          </label>
          <select
              id="history-select"
              value={selectedHistoryId}
              onChange={handleSelectHistory}
              style={{ padding: '8px 12px', borderRadius: '4px', fontSize: '14px' }}
          >
            <option value=""> New Reconciliation / Select from history </option>
            {historyList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : item.id} | Diff: {item.difference ?? 0}
                </option>
            ))}
          </select>
        </div>

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
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#28A745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : 'Start reconciliation'}
        </button>

        {result && (
            <div style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'stretch' }}>
                <div style={{ padding: '15px', background: '#e9ecef', borderRadius: '6px', flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  Total Bank: <strong>{result.totalBankBalance}</strong>
                </div>
                <div style={{ padding: '15px', background: '#e9ecef', borderRadius: '6px', flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  Total Ledger: <strong>{result.totalLedgerBalance}</strong>
                </div>
                <div style={{ padding: '15px', background: result.difference !== 0 ? '#f8d7da' : '#d4edda', borderRadius: '6px', flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  Difference: <strong>{result.difference}</strong>
                </div>
                <button
                    onClick={() => downloadExportReport(result)}
                    style={{flex: 1, padding: '15px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Download Export Report (CSV)
                </button>
              </div>

              <h3>Results</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                <tr style={{ background: '#f1f3f5', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px 12px 12px 30px' }}>Status</th>
                  <th style={{ padding: '12px 12px 12px 25px' }}>Date</th>
                  <th style={{ padding: '12px 12px 12px 70px' }}>Description / Ref</th>
                  <th style={{ padding: '12px' }}>Bank Amount</th>
                  <th style={{ padding: '12px' }}>Ledger Amount</th>
                </tr>
                </thead>
                <tbody>
                {(result.matchedBankTransactions || []).map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #eee', background: '#e6f4ea' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: '#ceead6', color: '#0d652d', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Match</span>
                      </td>
                      <td style={{ padding: '12px', color: '#555', fontSize: '14px' }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>{tx.description} ({tx.referenceNumber})</td>
                      <td style={{ padding: '12px' }}>{tx.amount}</td>
                      <td style={{ padding: '12px' }}>{tx.amount}</td>
                    </tr>
                ))}

                {(result.unmatchedBankTransactions || []).map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #eee', background: '#fce8e6' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: '#fad2cf', color: '#c5221f', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Only in Bank</span>
                      </td>
                      <td style={{ padding: '12px', color: '#555', fontSize: '14px' }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>{tx.description} ({tx.referenceNumber})</td>
                      <td style={{ padding: '12px' }}>{tx.amount}</td>
                      <td style={{ padding: '12px' }}>-</td>
                    </tr>
                ))}

                {(result.unmatchedLedgerTransactions || []).map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #eee', background: '#fce8e6' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: '#fad2cf', color: '#c5221f', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Only in Ledger</span>
                      </td>
                      <td style={{ padding: '12px', color: '#555', fontSize: '14px' }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>{tx.description} ({tx.accountCode})</td>
                      <td style={{ padding: '12px' }}>-</td>
                      <td style={{ padding: '12px' }}>{tx.amount}</td>
                    </tr>
                ))}
                </tbody>
              </table>
              {/* Кнопка открытия формы в конце таблицы */}
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    onClick={() => setShowAdjustmentsForm(!showAdjustmentsForm)}
                    style={{
                      padding: '12px 24px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      backgroundColor: '#17a2b8',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                >
                  {showAdjustmentsForm ? 'Hide Adjusting Entries Form' : 'Make adjusting entries'}
                </button>
              </div>
              {showAdjustmentsForm && (
                  <div style={{ marginTop: '25px', padding: '20px', border: '1px solid #007bff', borderRadius: '8px', background: '#f8f9fa' }}>
                    <h3 style={{ marginTop: 0 }}>Create Adjusting Entries</h3>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      <input
                          type="text"
                          placeholder="Account Code (e.g. 91.02)"
                          value={adjAccount}
                          onChange={(e) => setAdjAccount(e.target.value)}
                          style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                          type="number"
                          placeholder="Amount"
                          value={adjAmount}
                          onChange={(e) => setAdjAmount(e.target.value)}
                          style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                          type="text"
                          placeholder="Description"
                          value={adjDescription}
                          onChange={(e) => setAdjDescription(e.target.value)}
                          style={{ padding: '8px', flex: 2, borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <button
                          onClick={handleAddAdjustmentRow}
                          style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        + Add
                      </button>
                    </div>
                    
                    {adjustments.length > 0 && (
                        <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse', background: '#fff' }}>
                          <thead>
                          <tr style={{ background: '#e9ecef', textAlign: 'left' }}>
                            <th style={{ padding: '8px' }}>Account Code</th>
                            <th style={{ padding: '8px' }}>Amount</th>
                            <th style={{ padding: '8px' }}>Description</th>
                          </tr>
                          </thead>
                          <tbody>
                          {adjustments.map((adj, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '8px' }}>{adj.accountCode}</td>
                                <td style={{ padding: '8px' }}>{adj.amount}</td>
                                <td style={{ padding: '8px' }}>{adj.description}</td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                    )}

                    <button
                        onClick={handleSaveAndDownloadCsv}
                        disabled={adjustments.length === 0}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: adjustments.length === 0 ? '#6c757d' : '#007bff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '15px',
                          fontWeight: 'bold',
                          cursor: adjustments.length === 0 ? 'not-allowed' : 'pointer',
                        }}
                    >
                      Save Entries & Download CSV
                    </button>
                  </div>
              )}
            </div>
        )}
      </div>
  );
}