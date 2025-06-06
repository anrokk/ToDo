import axios from 'axios';
import type { LoginCredentials, RegisterInfo, JwtResponse, ProblemDetails } from '@/types';


const API_BASE_URL = 'https://taltech.akaver.com/api/v1/Account';


const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});


const getApiErrorMessage = (error: any, defaultMessage: string): string => {
    if (axios.isAxiosError(error) && error.response) {
        const problemDetails = error.response.data as ProblemDetails; 
        if (problemDetails) {
            if (problemDetails.title && problemDetails.errors) {
                const errorMessages = Object.values(problemDetails.errors).flat(); 
                return `${problemDetails.title}: ${errorMessages.join(' ')}`;
            }
            return problemDetails.title || problemDetails.detail || defaultMessage;
        }
        return error.response.data?.message || error.message || defaultMessage;
    }
    return error.message || defaultMessage;
};


export const authService = {

    login: async (credentials: LoginCredentials): Promise<JwtResponse> => {
        try {
            const response = await apiClient.post<JwtResponse>('/Login', credentials);
            return response.data;
        } catch (error){
            throw new Error(getApiErrorMessage(error, 'Login failed'));
        }
    },

    register: async (userInfo: RegisterInfo): Promise<JwtResponse> => {
        try {
            const response = await apiClient.post<JwtResponse>('/Register', userInfo);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, 'Registration failed'));
        }
    },

    refreshToken: async (refreshTokenModel: { jwt: string; refreshToken: string }): Promise<JwtResponse> => {
        try {
            const response = await apiClient.post<JwtResponse>('/RefreshToken', refreshTokenModel);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, 'Session refresh failed. Please log in again.'));
        }
    }
}