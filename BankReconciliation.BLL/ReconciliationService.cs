using BankReconciliation.Domain;

namespace BankReconciliation.BLL;

public class ReconciliationService
{
    public ReconciliationResult Reconcile(
        List<BankTransaction> bankTransactions, 
        List<LedgerTransaction> ledgerTransactions)
    {
        var result = new ReconciliationResult
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            TotalBankBalance = bankTransactions.Sum(t => t.Amount),
            TotalLedgerBalance = ledgerTransactions.Sum(t => t.Amount),
            BankTransactions = bankTransactions,
            LedgerTransactions = ledgerTransactions
        };

        var remainingLedger = ledgerTransactions.ToList();

        foreach (var bankTx in bankTransactions)
        {
            bankTx.ReconciliationResultId = result.Id;

            var match = remainingLedger.FirstOrDefault(lTx => 
                lTx.Amount == bankTx.Amount && 
                (lTx.Date.Date == bankTx.Date.Date || 
                 (!string.IsNullOrEmpty(bankTx.ReferenceNumber) && lTx.Description.Contains(bankTx.ReferenceNumber))));

            if (match != null)
            {
                bankTx.IsReconciled = true;
                bankTx.MatchedLedgerTransactionId = match.Id;

                match.IsReconciled = true;
                match.MatchedBankTransactionId = bankTx.Id;

                result.MatchedBankTransactions.Add(bankTx);
                result.MatchedLedgerTransactions.Add(match);

                remainingLedger.Remove(match);
            }
            else
            {
                bankTx.IsReconciled = false;
                bankTx.MatchedLedgerTransactionId = null;
                result.UnmatchedBankTransactions.Add(bankTx);
            }
        }
        foreach (var ledgerTx in ledgerTransactions)
        {
            ledgerTx.ReconciliationResultId = result.Id;
            if (remainingLedger.Contains(ledgerTx))
            {
                ledgerTx.IsReconciled = false;
                ledgerTx.MatchedBankTransactionId = null;
                result.UnmatchedLedgerTransactions.Add(ledgerTx);
            }
        }

        return result;
    }
}