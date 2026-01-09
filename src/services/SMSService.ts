import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://perfume-signaturefragrance-backend.vercel.app/api";

const SMSService = {
  sendOTP: async (phone: string): Promise<boolean> => {
    console.log(`Sending OTP to ${phone}`);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/otp/send`,
        { phone },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      return response.data?.success === true;
    } catch (error: any) {
      console.error("SMS Service Error:", error);
      
      // In development, simulate success
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP sent to ${phone}`);
        return true;
      }

      return false;
    }
  },

  verifyOTP: async (phone: string, otp: string): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/otp/verify`,
        { phone, otp },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      return response.data?.success === true;
    } catch (error: any) {
      console.error("Verify OTP Error:", error);
      return false;
    }
  },
};

export default SMSService;