using BankReconciliation.API.Dtos;
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
    [ProducesResponseType(typeof(ReconciliationResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reconcile([FromBody] ReconcileRequestDto request)
    {
        if (request.BankTransactions == null || request.LedgerTransactions == null)
        {
            return BadRequest("Lists of transactions cannot be empty");
        }
        
        var bankTransactions = request.BankTransactions.Select(dto => new BankTransaction
        {
            Id = Guid.NewGuid(),
            Date = dto.Date,
            Amount = dto.Amount,
            Description = dto.Description,
            ReferenceNumber = dto.ReferenceNumber
        }).ToList();

        var ledgerTransactions = request.LedgerTransactions.Select(dto => new LedgerTransaction
        {
            Id = Guid.NewGuid(),
            Date = dto.Date,
            Amount = dto.Amount,
            Description = dto.Description,
            AccountCode = dto.AccountCode
        }).ToList();

        var result = _reconciliationService.Reconcile(bankTransactions, ledgerTransactions);
        
        await _dbContext.ReconciliationResults.AddAsync(result);
        await _dbContext.SaveChangesAsync();
        
        return Ok(result);
    }
    
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var history = await _dbContext.ReconciliationResults
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(history);
    }
    
    [HttpPost("history/{id:guid}/adjustments")]
    public async Task<IActionResult> AddAdjustments(Guid id, [FromBody] List<CreateAdjustmentDto> dtos)
    {
        var reconciliationExists = await _dbContext.ReconciliationResults
            .AnyAsync(r => r.Id == id);

        if (!reconciliationExists)
        {
            return NotFound("Reconciliation record not found");
        }
        
        var newAdjustments = dtos.Select(dto => new AdjustmentEntry
        {
            Id = Guid.NewGuid(),
            ReconciliationResultId = id,
            AccountCode = dto.AccountCode,
            Amount = dto.Amount,
            Description = dto.Description,
            Date = DateTime.UtcNow
        }).ToList();
        
        await _dbContext.AdjustmentEntries.AddRangeAsync(newAdjustments);
        await _dbContext.SaveChangesAsync();

        return Ok(newAdjustments);
    }

    [HttpGet("history/{id:guid}")]
    public async Task<IActionResult> GetHistoryById(Guid id)
    {
        var result = await _dbContext.ReconciliationResults
            .Include(r => r.BankTransactions)
            .Include(r => r.LedgerTransactions)
            .Include(r => r.Adjustments)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }
    
    [HttpGet("bank-transactions")]
    public async Task<IActionResult> GetBankTransactions()
    {
        var transactions = await _dbContext.BankTransactions.ToListAsync();
        return Ok(transactions);
    }
}