class RecommendationService:
    def __init__(self, engine, ranker):
        self.engine = engine
        self.ranker = ranker

    async def get_recommendations(self, employee_id):
        candidates = await self.engine.generate_candidates(employee_id)
        ranked = await self.ranker.rank(candidates)
        return ranked
