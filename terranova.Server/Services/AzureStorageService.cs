using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace terranova.Server.Services
{
    public interface IAzureStorageService
    {
        Task<string> UploadProfileImageAsync(string userId, Stream imageStream, string contentType);
        Task<bool> DeleteProfileImageAsync(string userId, string imageUrl, bool isAdmin = false);
    }

    public class AzureStorageService : IAzureStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName = "profile-images";

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
            return blobClient.Uri.ToString();
        }

        public async Task<bool> DeleteProfileImageAsync(string userId, string imageUrl, bool isAdmin = false)
        {
            if (string.IsNullOrEmpty(userId) || !Uri.TryCreate(imageUrl, UriKind.Absolute, out Uri uri))
                return false;

            var blobName = Path.GetFileName(uri.LocalPath);
            string expectedPrefix = $"{userId}-";
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
    }
}
