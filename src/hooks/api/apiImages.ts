import { Capacitor } from "@capacitor/core";

const isNative = typeof window !== "undefined" && Capacitor.isNativePlatform();
const isLocal = !isNative && typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const images = {
    baseUrl: isLocal ? "http://localhost:8001/uploads" : "https://api.trussrental.in/uploads"
};

export default images;