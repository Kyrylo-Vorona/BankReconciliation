using BankReconciliation.BLL;
using BankReconciliation.DAL;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<BankDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<ReconciliationService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bank Reconciliation API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseAuthorization();
app.MapControllers();

app.Run();