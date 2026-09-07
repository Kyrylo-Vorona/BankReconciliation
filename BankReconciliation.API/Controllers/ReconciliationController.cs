using BankReconciliation.BLL;
using BankReconciliation.DAL;
using BankReconciliation.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankReconciliation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReconciliationController : ControllerBase
{
    private readonly BankDbContext _dbContext;
    private readonly ReconciliationService _reconciliationService;
    
    public ReconciliationController(BankDbContext dbContext, ReconciliationService reconciliationService)
    {
        _dbContext = dbContext;
        _reconciliationService = reconciliationService;
    }
    
    [HttpPost("reconcile")]
    public async Task<IActionResult> Reconcile([FromBody] ReconciliationRequest request)
    {
        if (request.BankTransactions == null || request.LedgerTransactions == null)
        {
            return BadRequest("Lists of transactions cannot be empty");
        }
        
        await _dbContext.BankTransactions.AddRangeAsync(request.BankTransactions);
        await _dbContext.LedgerTransactions.AddRangeAsync(request.LedgerTransactions);
        await _dbContext.SaveChangesAsync();
        
        var result = _reconciliationService.Reconcile(request.BankTransactions, request.LedgerTransactions);

        return Ok(result);
    }
    
    [HttpGet("bank-transactions")]
    public async Task<IActionResult> GetBankTransactions()
    {
        var transactions = await _dbContext.BankTransactions.ToListAsync();
        return Ok(transactions);
    }
}

public record ReconciliationRequest(
    List<BankTransaction> BankTransactions,
    List<LedgerTransaction> LedgerTransactions
);