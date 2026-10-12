const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const images = {
    baseUrl: isLocal ? "https://localhost:8001/uploads" : "https://129.121.134.1:4000/uploads"
};

export default images;