import apiClient from "./apiClient";

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    fname: string,
    lname: string,
    email: string,
    contact: string,
    password: string,
    confirmPassword: string,
}

// Login
export const loginUser = async (data: LoginData) => {
    const res = await apiClient.post("/users/login", data);

    if (res.data.token) {
        localStorage.setItem("token", res.data.token);
    }

    return res.data;
};

// Register
export const registerUser = async (data: RegisterData) => {
    const res = await apiClient.post("/users/signup", data);
    return res.data;
};