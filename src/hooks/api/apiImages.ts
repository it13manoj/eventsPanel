const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const images = {
    baseUrl: isLocal ? "http://localhost:8001/uploads" : "https://api.event.parakshtach.com/uploads"
};

export default images;