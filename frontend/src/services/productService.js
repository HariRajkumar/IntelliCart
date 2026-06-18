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

export const createProduct = async (data) => {
  const response = await api.post("/products/", data);
  return response.data;
};

export const updateProduct = async (productId, data) => {
  const response = await api.put(`/products/${productId}`, data);
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

export const uploadProductImage = async (productId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/products/${productId}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getDeliveryEstimate = async (productId, postalCode) => {
  const response = await api.get(`/products/${productId}/delivery-estimate`, {
    params: {
      postal_code: postalCode,
    },
  });
  return response.data;
};

export const getProductReviews = async (productId) => {
  const response = await api.get(`/products/${productId}/reviews`);
  return response.data;
};

export const submitProductReview = async (productId, reviewData) => {
  const response = await api.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};