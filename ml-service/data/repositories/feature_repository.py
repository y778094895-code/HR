class FeatureRepository:
    async def get_employee_features(self, employee_ids):
        return {}

class CacheManager:
    async def get(self, key):
        return None
    async def set(self, key, value, ttl=300):
        pass
