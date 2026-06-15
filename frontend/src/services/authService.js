import api from "../api/axios";

export const registerUser = async (data) => {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (
  email,
  password
) => {
  const formData = new FormData();

  formData.append("username", email);

  formData.append("password", password);

  const response = await api.post(
    "/auth/login",
    formData
  );

  return response.data;
};

export const sendOTP = async (email) => {
  const response = await api.post(
    "/auth/register/send-otp",
    { email }
  );

  return response.data;
};

export const verifyOTP = async (data) => {
  const response = await api.post(
    "/auth/register/verify-otp",
    data
  );

  return response.data;
};

export const resendOTP = async (email) => {
  const response = await api.post(
    "/auth/register/resend-otp",
    { email }
  );

  return response.data;
};

export const sendForgotPasswordOTP = async (email) => {
  const response = await api.post(
    "/auth/forgot-password/send-otp",
    { email }
  );

  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await api.post(
    "/auth/reset-password",
    {
      email,
      otp,
      new_password: newPassword,
    }
  );

  return response.data;
};

