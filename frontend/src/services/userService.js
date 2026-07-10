import api from "../api/axios";

export const getUserProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put("/users/me", data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.post("/users/change-password", data);
  return response.data;
};

export const addUserAddress = async (data) => {
  const response = await api.post("/users/addresses", data);
  return response.data;
};

export const updateUserAddress = async (addressId, data) => {
  const response = await api.put(`/users/addresses/${addressId}`, data);
  return response.data;
};

export const deleteUserAddress = async (addressId) => {
  const response = await api.delete(`/users/addresses/${addressId}`);
  return response.data;
};
