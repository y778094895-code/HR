export interface UserProfile {
    id: string;
    email: string;
    username: string; // Adjusted to match AuthContext usage
    fullName: string; // Adjusted to match AuthContext usage
    role: string;
    department?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: UserProfile;
    access_token: string; // Standardized to match typical JWT response
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
}
