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