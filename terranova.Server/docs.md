identity user documentation
https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity?view=aspnetcore-9.0&tabs=visual-studio
	entity types
		- user
		- role (admin, logged)
		  - role claim
		  - user claim
		- user token (jwt)
		- user login
		- user role
	https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity?view=aspnetcore-9.0&tabs=visual-studio

	default validation IdentityUser
	https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration?view=aspnetcore-9.0

Middleware
https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-9.0
	cors -> authentication -> authorization

Authentication
https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-9.0
	standards
	https://learn.microsoft.com/en-us/entra/fundamentals/introduction-identity-access-management#authentication-and-authorization-standards
		jwt https://jwt.io/
		https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols#tokens

jwt
	base64UrlEncode(Header).base64UrlEncode(Payload).Signature
		Header
			{
				"alg": "HS256",
				"typ": "JWT"
			}
		Payload
			{
				"admin": true,
				"userID": "1234567890",
				"name": "John Doe"
				"iat": 1516239022
			}
		Signature
			HMACSHA256(
				base64UrlEncode(header) + "." +
				base64UrlEncode(payload),
				>secret-key>
			)
	schemes (registered authentication handlers and their configuration options)
	https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-9.0
		all schemas
		https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.authenticationoptions?view=aspnetcore-9.0

authorization
https://learn.microsoft.com/en-us/aspnet/core/security/authorization/roles?view=aspnetcore-9.0


il subject dice qualcosa su utenti non loggati?
ProfileConsentStatus: Consenso alla profilazione (true/false) //conseso al salvataggio dei preferiti e dei drink creati. OBBLIGATORIO
la searchhistory la metto obbligatoria (senza profilazione)
i drink aggiunti dall'utente vengono salvati nel db generale insieme ad un campo per chi li ha creati?

1. Ruoli (Roles)
•	Admin: Amministratori del sistema con accesso completo
•	User: Utenti registrati con funzionalità base
•	Premium: Utenti con funzionalità aggiuntive (opzionale, per future estensioni)

2. Claim (Informazioni dell'utente)
Claims di Base
•	UserID: Identificativo univoco dell'utente
•	Email: Email dell'utente per comunicazioni
•   Username: Nome utente per l'accesso
Claims di Privacy
• 	SearchHistorySaveConsent: consenso al salvataggio della history di ricerca // Obbligatoria?
•	MarketingConsent: cosa puo essere usato per dare i suggerimenti personalizzati? //senno sarà random
•	dati delle ricerche //la history deve essere attiva
•   cocktail preferiti e creati
•   delle preferenze
Claims di Preferenze
•	BirthDate: Data di nascita, fondamentale per le policy legate all'alcol
•	AlcoholContentPreference: Preferenza per cocktail alcolici o analcolici
•	Language: Preferenza linguistica dell'utente       PREDEFINITO INGLESE
•	MeasurementSystem: Sistema di misura preferito (metrico/imperiale)          PREDEFINITO METRICO
•	GlassPreference: Preferenza per il tipo di bicchiere
•	BaseIngredientPreference: Preferenze sui liquori base (gin, vodka, rum, ecc.)

3. Policy (Criteri di autorizzazione): criteria defined with roles, claims and logic connecting them
Policy di Ruolo
•	AdminOnly: Limita l'accesso solo agli amministratori
•	Per gestione utenti, moderazione contenuti, statistiche generali
•	AuthenticatedUserOnly: Richiede autenticazione (utenti registrati)
•	Per salvare preferiti, visualizzare area personale, creare cocktail personalizzati
Policy di Età
•	Over18: Richiede che l'utente sia maggiorenne
•	Per visualizzare e interagire con cocktail alcolici
•	Under18: Specifica per utenti minorenni
•	Per limitare automaticamente la visualizzazione a cocktail analcolici
Policy di Consenso
•	ProfilingAllowed: Richiede consenso esplicito alla profilazione
•	Per raccogliere dati sulle ricerche e preferenze per suggerimenti personalizzati
•	SearchHistorySaveAllowed: Richiede consenso al salvataggio delle ricerche
•	Per memorizzare le ricerche passate dell'utente
•	MarketingAllowed: Richiede consenso per suggerimenti personalizzati
•	Per mostrare suggerimenti basati sulle preferenze
Policy Composite
•	AlcoholContentAccessPolicy: Combina autenticazione e verifica età
•	AuthenticatedUserOnly + Over18
•	Per accedere ai contenuti con bevande alcoliche
•	PersonalizedRecommendationsPolicy: Combina autenticazione e consenso profiling
•	AuthenticatedUserOnly + ProfilingAllowed
•	Per generare e mostrare raccomandazioni personalizzate
•	CustomRecipeCreationPolicy: Policy per creare ricette personalizzate
•	AuthenticatedUserOnly (base)
•	Per permettere agli utenti di creare e salvare ricette personali


per ora i ruoli sono hardcodati nel db
salvo la data di nascita ma poi devo ancora calcolare l'età
aggiungi un post per le preferenze nel file controllers/AccountEndpoints.cs
il ruolo admin deve essere anche user e premium in automatico