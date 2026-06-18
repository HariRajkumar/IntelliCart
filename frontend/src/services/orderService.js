import api from "../api/axios";

export const checkout = async (checkoutData) => {
  const response = await api.post(
    "/orders/checkout",
    checkoutData
  );

  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(
    "/orders/my-orders"
  );

  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get("/orders/");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/cancel`);
  return response.data;
};