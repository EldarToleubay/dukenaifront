import axios from 'axios';
import type { SupplyRequest, Product } from '../types/inventory';

const BASE_URL = 'https://dukenaiback-production.up.railway.app';

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Keep this as a thin hook-point for existing refresh flow integration.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Delegate to global refresh flow if the project already has one wired.
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }
    throw error;
  },
);

export async function getProductByBarcode(barcode: string) {
  const { data } = await api.get<Product>(`/products/${barcode}`);
  return data;
}

export async function submitInitialStock(storeId: string, payload: SupplyRequest) {
  const { data } = await api.post(`/stores/${storeId}/inventory/supply`, payload);
  return data;
}
