import api from "../api/axios";

export const addToCart = async (
  productId,
  quantity = 1
) => {
  const response = await api.post(
    "/cart/add",
    {
      product_id: productId,
      quantity,
    }
  );

  return response.data;
};

export const getCart = async () => {
  const response = await api.get(
    "/cart"
  );

  return response.data;
};