class FairnessService:
    def __init__(self, analyzer):
        self.analyzer = analyzer

    async def analyze_department(self, department_id):
        return await self.analyzer.analyze(department_id)
