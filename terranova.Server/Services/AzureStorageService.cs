using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace terranova.Server.Services
{
    public interface IAzureStorageService
    {
        Task<string> UploadProfileImageAsync(string userId, Stream imageStream, string contentType);
        Task<bool> DeleteProfileImageAsync(string userId, string imageUrl, bool isAdmin = false);
        Task<string> UploadCocktailImageAsync(string userId, Stream imageStream, string contentType);
        Task<bool> DeleteCocktailImageAsync(string userId, string imageUrl, bool isAdmin = false);
    }

    public class AzureStorageService : IAzureStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName = "profile-images";
        private readonly string _cocktailContainerName = "cocktail-images";

        public AzureStorageService(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("BlobAzuriteConnectionString");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public async Task<string> UploadProfileImageAsync(string userId, Stream imageStream, string contentType)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var blobName = $"{userId}-{Guid.NewGuid()}";
            var blobClient = containerClient.GetBlobClient(blobName);

            await blobClient.UploadAsync(imageStream, new BlobHttpHeaders { ContentType = contentType });
            return blobClient.Uri.ToString().Replace("http://azurite:10000", "http://localhost:10000");
        }

        public async Task<bool> DeleteProfileImageAsync(string userId, string imageUrl, bool isAdmin = false)
        {
            if (string.IsNullOrEmpty(userId) || !Uri.TryCreate(imageUrl, UriKind.Absolute, out Uri uri))
                return false;

            var blobName = Path.GetFileName(uri.LocalPath);
            string expectedPrefix = $"propic-{userId}-";
            if (!isAdmin)
            { 
                if (!blobName.StartsWith(expectedPrefix))
                {
                    return false;
                }
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            return await blobClient.DeleteIfExistsAsync();
        }

        public async Task<string> UploadCocktailImageAsync(string userId, Stream imageStream, string contentType)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_cocktailContainerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var blobName = $"cocktail-{userId}-{Guid.NewGuid()}";
            var blobClient = containerClient.GetBlobClient(blobName);

            await blobClient.UploadAsync(imageStream, new BlobHttpHeaders { ContentType = contentType });
            return blobClient.Uri.ToString().Replace("http://azurite:10000", "http://localhost:10000");

        }

        public async Task<bool> DeleteCocktailImageAsync(string userId, string imageUrl, bool isAdmin = false)
        {
            if (string.IsNullOrEmpty(userId) || !Uri.TryCreate(imageUrl, UriKind.Absolute, out Uri uri))
                return false;

            var blobName = Path.GetFileName(uri.LocalPath);
            string expectedPrefix = $"cocktail-{userId}-";
            if (!isAdmin)
            {
                if (!blobName.StartsWith(expectedPrefix))
                {
                    return false;
                }
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(_cocktailContainerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            return await blobClient.DeleteIfExistsAsync();
        }
    }
}
