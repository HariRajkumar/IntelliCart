import api from "../api/axios";

export const checkout = async () => {
  const response = await api.post(
    "/orders/checkout"
  );

  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(
    "/orders/my-orders"
  );

  return response.data;
};