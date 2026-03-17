from core.event_bus import event_bus
from services.prediction_service import PredictionService

prediction_service = PredictionService()

class EmployeeEventHandler:
    def __init__(self):
        pass

    async def start_listening(self):
        # Subscribe to employee events
        await event_bus.subscribe(
            service='employee',
            event_types=['employee.created', 'employee.updated'],
            handler=self.on_employee_updated
        )
        print("EmployeeEventHandler listening...")

    async def on_employee_updated(self, event):
        """Handle employee update events"""
        print(f"Received employee event: {event}")
        data = event.get('data', {})
        employee_id = data.get('id')
        
        # Trigger ML prediction
        if employee_id:
           print(f"Triggering prediction update for employee {employee_id}")
           try:
               # In a real scenario, we'd fetch features or use data from event
               prediction = prediction_service.predict_turnover(data)
               
               # Publish risk updated event
               await event_bus.publish(
                   service='turnover',
                   event_type='turnover.risk.updated',
                   data={
                       "employeeId": employee_id,
                       "riskScore": prediction.get("risk_score"),
                       "riskLevel": prediction.get("risk_level"),
                       "timestamp": event.get("timestamp")
                   }
               )
           except Exception as e:
               print(f"Error predicting turnover for {employee_id}: {e}")

handler = EmployeeEventHandler()
