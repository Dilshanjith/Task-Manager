import axios from 'axios';

const API_URL = 'http://localhost:5231/api/auth';

export const authService = {
    sendOtp: async (email: string) => {
        return await axios.post(`${API_URL}/send-otp`, { email });
    },

    verifyOtp: async (email: string, code: string) => {
        return await axios.post(`${API_URL}/verify-otp`, { email, code });
    }
};
