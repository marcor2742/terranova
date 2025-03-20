const { env } = require('process');

// Your API server is on port 5299
const apiTarget = 'http://localhost:5299';

// Keep the original ASP.NET target for any ASP.NET specific endpoints
const aspNetTarget = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7073';

const PROXY_CONFIG = [
  {
    // Add all your API endpoints here
    context: [
      "/login",
      "/register",
      "/user",
      "/user/me",
      "/auth"
    ],
    target: apiTarget,
    secure: false,
    changeOrigin: true
  },
  {
    // Keep the original weatherforecast endpoint for ASP.NET
    context: [
      "/weatherforecast",
    ],
    target: aspNetTarget,
    secure: false
  }
]

module.exports = PROXY_CONFIG;