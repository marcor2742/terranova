const { env } = require('process');

// Force IPv4 instead of IPv6
const apiTarget = 'http://127.0.0.1:5299';

// Change this to IPv4 as well
const aspNetTarget = env.ASPNETCORE_HTTPS_PORT ? `https://127.0.0.1:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.replace('localhost', '127.0.0.1') : 'https://127.0.0.1:7073';

const PROXY_CONFIG = [
  {
    context: [
	  "/api/login",
      "/api/register",
      "/api/user",
      "/api/user/me",
      "/api/auth"
    ],
    target: apiTarget,
    secure: false,
    changeOrigin: true,
    // Add this to force IPv4
    hostRewrite: '127.0.0.1',
    // Add this to disable IPv6
    configure: (proxy) => {
      proxy.on('proxyReq', function(proxyReq, req, res) {
        proxyReq.setHeader('host', '127.0.0.1:5299');
      });
    }
  },
  {
    context: [
      "/weatherforecast",
    ],
    target: aspNetTarget,
    secure: false
  }
]

module.exports = PROXY_CONFIG;