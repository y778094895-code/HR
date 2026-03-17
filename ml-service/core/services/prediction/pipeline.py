class PredictionPipeline:
    def __init__(self):
        self.steps = []

    def add_step(self, step):
        self.steps.append(step)

    async def run(self, data):
        result = data
        for step in self.steps:
            result = await step(result)
        return result
