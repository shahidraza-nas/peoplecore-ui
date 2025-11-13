import {
    ApiError,
    ApiResponse,
    AuthResponse,
    ChangePasswordData,
    ForgotPasswordData,
    LoginData,
    OtpResponse,
    RegisterData,
    ResetPasswordData,
    SendOtpData,
    User,
    VerifyOtpData,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getHeaders(includeAuth = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    private setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    private removeToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.clear();
            sessionStorage.clear();
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        includeAuth = false
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const config: RequestInit = {
            ...options,
            headers: {
                ...this.getHeaders(includeAuth),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const error: ApiError = {
                    message: data.message || 'An error occurred',
                    statusCode: response.status,
                    error: data.error,
                };
                throw error;
            }

            return data as T;
        } catch (error) {
            if ((error as ApiError).statusCode) {
                throw error;
            }
            throw {
                message: 'Network error. Please check your connection.',
                statusCode: 0,
            } as ApiError;
        }
    }

    // Auth Methods
    async login(data: LoginData): Promise<ApiResponse<AuthResponse | OtpResponse>> {
        const response = await this.request<ApiResponse<AuthResponse | OtpResponse>>(
            '/auth/local',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );

        if ('token' in response.data) {
            this.setToken(response.data.token);
            if (typeof window !== 'undefined') {
                localStorage.setItem('refresh_token', response.data.refresh_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response;
    }

    async register(data: RegisterData): Promise<ApiResponse<{ user: User }>> {
        return this.request<ApiResponse<{ user: User }>>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async logout(): Promise<ApiResponse<null>> {
        try {
            const response = await this.request<ApiResponse<null>>(
                '/auth/logout',
                {
                    method: 'POST',
                    body: JSON.stringify({}),
                },
                true
            );
            this.removeToken();
            return response;
        } catch (error) {
            this.removeToken();
            throw error;
        }
    }

    async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<{ session_id: string }>> {
        return this.request<ApiResponse<{ session_id: string }>>(
            '/auth/password/forgot',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    }

    async resetPassword(data: ResetPasswordData): Promise<ApiResponse<null>> {
        return this.request<ApiResponse<null>>('/auth/password/reset', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async verifyOtp(data: VerifyOtpData): Promise<ApiResponse<AuthResponse | { session_id: string }>> {
        const response = await this.request<ApiResponse<AuthResponse | { session_id: string }>>(
            '/auth/otp/verify',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );

        // If OTP verification leads to login, store token
        if ('token' in response.data) {
            this.setToken(response.data.token);
            if (typeof window !== 'undefined') {
                localStorage.setItem('refresh_token', response.data.refresh_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response;
    }

    async sendOtp(data: SendOtpData): Promise<ApiResponse<{ session_id: string; resend_limit?: number }>> {
        return this.request<ApiResponse<{ session_id: string; resend_limit?: number }>>(
            '/auth/otp/send',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    }

    async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refresh_token: string; token_expiry: string }>> {
        const response = await this.request<ApiResponse<{ token: string; refresh_token: string; token_expiry: string }>>(
            '/auth/token',
            {
                method: 'POST',
                body: JSON.stringify({ refresh_token: refreshToken }),
            }
        );
        this.setToken(response.data.token);
        if (typeof window !== 'undefined') {
            localStorage.setItem('refresh_token', response.data.refresh_token);
        }

        return response;
    }

    async changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
        return this.request<ApiResponse<null>>(
            '/user/password',
            {
                method: 'PUT',
                body: JSON.stringify(data),
            },
            true
        );
    }

    async getMe(): Promise<ApiResponse<{ user: User }>> {
        return this.request<ApiResponse<{ user: User }>>('/user/me', {}, true);
    }

    async updateMe(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
        return this.request<ApiResponse<{ user: User }>>(
            '/user/me',
            {
                method: 'PUT',
                body: JSON.stringify(data),
            },
            true
        );
    }

    // Profile Methods (aliases for getMe/updateMe)
    async getProfile(): Promise<ApiResponse<{ user: User }>> {
        return this.getMe();
    }

    async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
        return this.updateMe(data);
    }

    async uploadAvatar(file: File): Promise<ApiResponse<{ user: User }>> {
        const formData = new FormData();
        formData.append('avatar', file);

        const url = `${this.baseURL}/user/me/avatar`;
        const token = this.getToken();

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                const error: ApiError = {
                    message: data.message || 'Failed to upload avatar',
                    statusCode: response.status,
                    error: data.error,
                };
                throw error;
            }

            return data as ApiResponse<{ user: User }>;
        } catch (error) {
            if ((error as ApiError).statusCode) {
                throw error;
            }
            throw {
                message: 'Network error. Please check your connection.',
                statusCode: 0,
            } as ApiError;
        }
    }

    // Employee/User Management (Admin only)
    async createEmployee(data: any): Promise<ApiResponse<{ user: User }>> {
        return this.request<ApiResponse<{ user: User }>>(
            '/user',
            {
                method: 'POST',
                body: JSON.stringify(data),
            },
            true
        );
    }

    async getUsers(query?: string): Promise<ApiResponse<{ users: User[]; count: number }>> {
        const url = query ? `/user${query}` : '/user';
        return this.request<ApiResponse<{ users: User[]; count: number }>>(
            url,
            {},
            true
        );
    }

    async getUserById(id: number): Promise<ApiResponse<{ user: User }>> {
        return this.request<ApiResponse<{ user: User }>>(
            `/user/${id}`,
            {},
            true
        );
    }

    async updateUser(id: number, data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
        return this.request<ApiResponse<{ user: User }>>(
            `/user/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            },
            true
        );
    }

    async deleteUser(id: number): Promise<ApiResponse<null>> {
        return this.request<ApiResponse<null>>(
            `/user/${id}`,
            {
                method: 'DELETE',
            },
            true
        );
    }

    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }
    getStoredUser(): User | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    return JSON.parse(userStr);
                } catch {
                    return null;
                }
            }
        }
        return null;
    }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
