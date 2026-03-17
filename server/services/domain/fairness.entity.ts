export class FairnessEntity {
    constructor(
        public id: string,
        public value: number,
        public metrics: any,
        public analysisDate: Date
    ) { }
}
