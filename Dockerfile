
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["BankReconciliation.sln", "./"]
COPY ["BankReconciliation.API/BankReconciliation.API.csproj", "BankReconciliation.API/"]
COPY ["BankReconciliation.BLL/BankReconciliation.BLL.csproj", "BankReconciliation.BLL/"]
COPY ["BankReconciliation.DAL/BankReconciliation.DAL.csproj", "BankReconciliation.DAL/"]
COPY ["BankReconciliation.Domain/BankReconciliation.Domain.csproj", "BankReconciliation.Domain/"]
COPY ["BankReconciliation.Tests/BankReconciliation.Tests.csproj", "BankReconciliation.Tests/"]

RUN dotnet restore "BankReconciliation.sln"

COPY . .

WORKDIR "/src/BankReconciliation.API"
RUN dotnet publish "BankReconciliation.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "BankReconciliation.API.dll"]