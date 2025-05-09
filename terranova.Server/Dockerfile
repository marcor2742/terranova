FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER app
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS with-node
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get -y install nodejs
RUN npm install -g @angular/cli

FROM with-node AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["terranova.Server/terranova.Server.csproj", "terranova.Server/"]
COPY ["terranova.client/terranova.client.esproj", "terranova.client/"]
COPY ["terranova.client/package*.json", "terranova.client/"]

# Installa dipendenze npm
WORKDIR /src/terranova.client
RUN npm ci --quiet

# Torna alla directory principale e copia il resto dei file
WORKDIR /src
COPY . .

# Build Angular con output esplicito
WORKDIR "/src/terranova.client"
RUN npm run build
# Debug: mostra i file generati dal build
RUN find /src/terranova.client/dist -type f | sort

# Build .NET
WORKDIR "/src/terranova.Server"
RUN dotnet build "./terranova.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
WORKDIR "/src/terranova.Server"
RUN dotnet publish "./terranova.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Assicuriamoci che la directory wwwroot esista
RUN mkdir -p /app/wwwroot
# Copia correttamente tutti i file Angular
COPY --from=build /src/terranova.client/dist/terranova.client/browser/ /app/wwwroot/
# Debug finale: verifica che i file siano stati copiati correttamente
RUN find /app/wwwroot -type f | sort

ENTRYPOINT ["dotnet", "terranova.Server.dll"]
