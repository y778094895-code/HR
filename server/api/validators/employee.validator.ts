export function validateEmployeeRequest(query: any) {
    // Mock validation logic for filters
    return {
        valid: true,
        data: {
            filters: query,
            pagination: { page: 1, limit: 10 }
        },
        errors: []
    };
}
