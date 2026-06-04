import api from "../api/axios";

export const getProducts = async (
  params = {}
) => {
  const response = await api.get(
    "/products",
    {
      params,
    }
  );

  return response.data;
};

export const getProductById = async (
  productId
) => {
  const response = await api.get(
    `/products/${productId}`
  );

  return response.data;
};