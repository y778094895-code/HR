class PredictionValidator:
    def validate(self, request):
        if not request.employee_ids:
            return False, "No employee IDs provided"
        return True, ""
