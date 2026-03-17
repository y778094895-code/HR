export class InterventionEntity {
    constructor(
        public id: string,
        public employeeId: string,
        public type: string,
        public status: string,
        public actions: any[]
    ) { }
}
