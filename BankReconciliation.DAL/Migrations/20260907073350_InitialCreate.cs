using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankReconciliation.DAL.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BankTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "text", nullable: false),
                    IsReconciled = table.Column<bool>(type: "boolean", nullable: false),
                    MatchedLedgerTransactionId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankTransactions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LedgerTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    AccountCode = table.Column<string>(type: "text", nullable: false),
                    IsReconciled = table.Column<bool>(type: "boolean", nullable: false),
                    MatchedBankTransactionId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LedgerTransactions", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BankTransactions");

            migrationBuilder.DropTable(
                name: "LedgerTransactions");
        }
    }
}
