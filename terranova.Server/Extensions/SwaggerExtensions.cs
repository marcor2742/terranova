using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using terranova.Server.Models;
using System.Reflection;
using Microsoft.AspNetCore.Http;

namespace terranova.Server.Extensions
{
    public class DefaultResponsesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            if (operation.Responses == null)
            {
                operation.Responses = new OpenApiResponses();
            }

            var httpMethod = context.ApiDescription.HttpMethod?.ToUpperInvariant();

            operation.Responses.TryAdd("200", new OpenApiResponse { Description = "Success" });
            operation.Responses.TryAdd("201", new OpenApiResponse { Description = "Created" });
            operation.Responses.TryAdd("204", new OpenApiResponse { Description = "No Content" });
            operation.Responses.TryAdd("400", new OpenApiResponse { Description = "Bad Request" });
            operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Unauthorized" });
            operation.Responses.TryAdd("403", new OpenApiResponse { Description = "Forbidden" });
            operation.Responses.TryAdd("404", new OpenApiResponse { Description = "Not Found" });
        }
    }


    public static class SwaggerExtensions
    {
        public static IServiceCollection AddSwaggerExplorer(this IServiceCollection services)
        {
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Fill in the JWT token",
                });
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id="Bearer"
                            }
                        },
                        new List<String>()
                    }
                });

                //images
                options.OperationFilter<FileUploadOperationFilter>();
                options.OperationFilter<DefaultResponsesOperationFilter>();

                options.CustomOperationIds(api =>
                {
                    if (api.RelativePath?.Contains("uploadProfileImage") == true)
                        return "UploadProfileImage";
                    return api.TryGetMethodInfo(out var methodInfo) ? methodInfo.Name : null;
                });
            });
            return services;
        }

        public static WebApplication ConfigureSwaggerExplorer(this WebApplication app)
        {
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            return app;
        }
    }

    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var fileParameters = context.MethodInfo?.GetParameters()
                .Where(p => p.ParameterType == typeof(IFormFile) ||
                            (p.ParameterType == typeof(HttpRequest) &&
                             context.ApiDescription.HttpMethod?.ToUpperInvariant() == "POST"))
                .ToList();

            if (fileParameters == null || fileParameters.Count == 0)
                return;

            if (context.ApiDescription.RelativePath?.Contains("uploadProfileImage") == true ||
                operation.OperationId?.Contains("Upload") == true)
            {
                if (operation.RequestBody == null)
                {
                    operation.RequestBody = new OpenApiRequestBody
                    {
                        Content = new Dictionary<string, OpenApiMediaType>()
                    };
                }

                var contentType = "multipart/form-data";
                if (!operation.RequestBody.Content.ContainsKey(contentType))
                {
                    operation.RequestBody.Content[contentType] = new OpenApiMediaType
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "object",
                            Properties = new Dictionary<string, OpenApiSchema>
                            {
                                ["file"] = new OpenApiSchema
                                {
                                    Type = "string",
                                    Format = "binary",
                                    Description = "File to upload"
                                }
                            },
                            Required = new HashSet<string> { "file" }
                        }
                    };
                }
            }
        }
    }

}
