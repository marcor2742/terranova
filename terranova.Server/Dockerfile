FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

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

# Crea directory per i certificati HTTPS e genera il certificato
RUN mkdir -p /src/terranova.Server/https
RUN dotnet dev-certs https -ep /src/terranova.Server/https/terranova.pfx -p StrongPassword123!
RUN chmod 644 /src/terranova.Server/https/terranova.pfx

WORKDIR /src/terranova.client
RUN npm ci --quiet

WORKDIR /src
COPY . .

WORKDIR "/src/terranova.client"
RUN npm run build
RUN find /src/terranova.client/dist -type f | sort

WORKDIR "/src/terranova.Server"
RUN dotnet build "./terranova.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
WORKDIR "/src/terranova.Server"
RUN dotnet publish "./terranova.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
USER root
WORKDIR /app

# Crea la directory per i certificati e imposta i permessi
RUN mkdir -p /app/https
RUN chown -R app:app /app/https

# Torna all'utente app
USER app

COPY --from=publish /app/publish .

COPY --from=build /src/terranova.Server/https/terranova.pfx /app/https/

# Verifica che il certificato esista
RUN ls -la /app/https/

RUN mkdir -p /app/wwwroot
COPY --from=build /src/terranova.client/dist/terranova.client/browser/ /app/wwwroot/
RUN find /app/wwwroot -type f | sort

ENTRYPOINT ["dotnet", "terranova.Server.dll"]
