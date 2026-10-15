import { useState, useEffect, useCallback } from "react";
import apiClient from "./api/apiClient";

export interface CompanyInfo {
  id?: number;
  companyName: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  gstNumber?: string;
  gst?: string;
  foundedYear?: string | number;
  totalEvents?: string | number;
  teamMembers?: string | number;
  aboutCompany?: string;
  about?: string;
  logo: string | null;
}

const STORAGE_KEY = "company_profile";
const EVENT_NAME = "company_profile_updated";

export const getStoredCompany = (): CompanyInfo | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const updateStoredCompany = (companyData: CompanyInfo) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companyData));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.error("Failed to store company profile", err);
  }
};

export const useCompany = () => {
  const [company, setCompany] = useState<CompanyInfo | null>(getStoredCompany());
  const [loading, setLoading] = useState(false);

  const fetchCompany = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/Companies/1");
      const data = res.data?.data;
      if (data) {
        const normalized: CompanyInfo = {
          id: data.id || 1,
          companyName: data.companyName || "Company Name",
          email: data.email || "",
          phone: data.phone || "",
          website: data.website || "",
          address: data.address || "",
          gstNumber: data.gstNumber || data.gst || "",
          gst: data.gstNumber || data.gst || "",
          foundedYear: data.foundedYear || "",
          totalEvents: data.totalEvents || "",
          teamMembers: data.teamMembers || "",
          aboutCompany: data.aboutCompany || data.about || "",
          about: data.aboutCompany || data.about || "",
          logo: data.logo || null,
        };
        setCompany(normalized);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
    } catch (err) {
      console.error("Failed to fetch company profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();

    const handleUpdate = () => {
      setCompany(getStoredCompany());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
    };
  }, [fetchCompany]);

  return { company, loading, refreshCompany: fetchCompany };
};

