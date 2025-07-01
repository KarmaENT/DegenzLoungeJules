import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'; // Adjust if your API URL is different

// Helper to get auth token (implement as per your auth system)
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken'); // Or however you store your token
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// --- User Settings API --- 
export const fetchUserSettings = async () => {
  const response = await axios.get(`${API_URL}/settings/user`, { headers: getAuthHeaders() });
  return response.data;
};

export const updateUserSettings = async (settingsData: any) => {
  const response = await axios.put(`${API_URL}/settings/user`, settingsData, { headers: getAuthHeaders() });
  return response.data;
};

// --- User AI Provider API Keys API --- 
export const fetchUserAIProviderKeys = async () => {
  const response = await axios.get(`${API_URL}/settings/user/ai-provider-keys`, { headers: getAuthHeaders() });
  return response.data;
};

export const addUserAIProviderKey = async (providerKeyData: { provider_id: string; api_key: string }) => {
  const response = await axios.post(`${API_URL}/settings/user/ai-provider-keys`, providerKeyData, { headers: getAuthHeaders() });
  return response.data;
};

export const updateUserAIProviderKey = async (providerId: string, apiKey: string) => {
  const response = await axios.put(`${API_URL}/settings/user/ai-provider-keys/${providerId}`, { api_key: apiKey }, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteUserAIProviderKey = async (providerId: string) => {
  await axios.delete(`${API_URL}/settings/user/ai-provider-keys/${providerId}`, { headers: getAuthHeaders() });
};

// --- App/Admin Settings API --- (Ensure admin privileges are checked server-side)
export const fetchAppSettings = async () => {
  const response = await axios.get(`${API_URL}/settings/app`, { headers: getAuthHeaders() }); // Assumes admin token
  return response.data;
};

export const updateAppSetting = async (settingKey: string, value: any) => {
  const response = await axios.put(`${API_URL}/settings/app/${settingKey}`, { value: String(value) }, { headers: getAuthHeaders() }); // Assumes admin token
  return response.data;
};

