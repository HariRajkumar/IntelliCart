import api from "../api/axios";

export const getCategories = async () => {
  const response = await api.get(
    "/categories/"
  );

  return response.data;
};