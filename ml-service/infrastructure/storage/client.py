import os

class StorageClient:
    async def download_model(self, location: str, checksum: str) -> str:
        # Mock download logic
        # In reality, would download from S3/GCS to local path
        if not os.path.exists(location):
            # Create a dummy file if not exists
            os.makedirs(os.path.dirname(location), exist_ok=True)
            with open(location, 'wb') as f:
                f.write(b'dummy model content')
        return location
