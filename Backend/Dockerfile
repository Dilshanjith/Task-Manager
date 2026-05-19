FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["Backend.csproj", "./"]
RUN dotnet restore "Backend.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose port 8080 (Render's default port)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Backend.dll"]
