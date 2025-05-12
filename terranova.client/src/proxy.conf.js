const { env } = require("process");

// Force IPv4 instead of IPv6
const apiTarget = "http://localhost:5299";

// Change this to IPv4 as well
//const aspNetTarget = env.ASPNETCORE_HTTPS_PORT ? `https://127.0.0.1:${env.ASPNETCORE_HTTPS_PORT}` :
//	env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.replace('localhost', '127.0.0.1') : 'https://127.0.0.1:7073';

const aspNetTarget = "http://localhost:7073";

const PROXY_CONFIG = [
	{
		context: [
			"/api/loginextended",
			"/api/registerextended",
			"/api/userProfile",
			"/api/auth",
			"/api/refreshextended",
			"/api/search",
			"/api/cocktail",
			"/api/ingredientsTable",
			"/api/favorites",
			"/api/isInFavorites",
			"/api/glassesTable",
			"/api/preferences",
			"/api/categoriesTable",
			"/api/suggestedDrinks",
			"/api/allCocktails",
			"/api/editCocktails",
			"/api/uploadCocktailImage",
			"/api/uploadProfileImage",
			"/api/addProfileInfo",
			"/api/logoutextended",
		],
		target: apiTarget,
		secure: false,
		changeOrigin: true,
		////hostRewrite: '127.0.0.1',
		////configure: (proxy) => {
		////	proxy.on('proxyReq', function (proxyReq, req, res) {
		////		proxyReq.setHeader('host', '127.0.0.1:5299');
		////	});
		////}
	},
	{
		context: ["/weatherforecast"],
		target: aspNetTarget,
		secure: false,
	},
];

module.exports = PROXY_CONFIG;
