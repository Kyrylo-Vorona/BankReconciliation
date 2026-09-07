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
            TotalBankBalance = bankTransactions.Sum(t => t.Amount),
            TotalLedgerBalance = ledgerTransactions.Sum(t => t.Amount)
        };

        var remainingLedger = ledgerTransactions.ToList();

        foreach (var bankTx in bankTransactions)
        {
            var match = remainingLedger.FirstOrDefault(lTx => 
                lTx.Amount == bankTx.Amount && 
                (lTx.Date.Date == bankTx.Date.Date || lTx.Description.Contains(bankTx.ReferenceNumber)));

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
                result.UnmatchedBankTransactions.Add(bankTx);
            }
        }

        result.UnmatchedLedgerTransactions = remainingLedger;

        return result;
    }
}