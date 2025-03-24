identity user documentation
https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity?view=aspnetcore-9.0&tabs=visual-studio
	entity types
		- user
		- role (admin, logged, gdpr?)
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
		https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.authenticationoptions?view=aspnetcore-9.0aaaa