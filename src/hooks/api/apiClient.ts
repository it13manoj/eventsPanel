import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.event.parakshtach.com/api/v1",
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor (attach token)
apiClient.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;