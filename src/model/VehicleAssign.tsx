import React, { useState, useEffect, useRef } from "react";
import apiClient from "../hooks/api/apiClient";
import images from "../hooks/api/apiImages";
import { toast } from "react-toastify";
import {
  Truck,
  Fuel,
  MapPin,
  Calendar,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  X,
  Edit3,
  Camera,
  RotateCcw,
  SwitchCamera,
  Check
} from "lucide-react";
import { EVENT_STATUSES, normalizeStatusCode, getStatusBadgeClass, getStatusLabel } from "../utils/eventStatus";

interface Agent {
  id: number;
  name: string;
}

interface Vehicle {
  id: number;
  name: string;
  vehicle_number: string;
  vehicle_type_id: number;
  owner_agency: string;
  contact: number;
  driver_contact: number;
  ownershiptype: string;
  load_capacity: number;
  commission: string;
  insurance: string;
  image: string;
  status: string;
}

interface AssignedVehicle {
  id: number;
  event_id: number;
  type: string;
  agent_name: string;
  vehicle_id: number;
  fuel_type: string | null;
  fuel_quantity: number | null;
  fuel_amount: number | null;
  loading_image: string | null;
  loading_datetime: string | null;
  loading_location: string | null;
  unloading_image: string | null;
  unloading_datetime: string | null;
  unloading_location: string | null;
  event_loading_image: string | null;
  event_loading_datetime: string | null;
  event_loading_location: string | null;
  event_unloading_image: string | null;
  event_unloading_datetime: string | null;
  event_unloading_location: string | null;
  status: string;
  name?: string;
  vehicle_number?: string;
  owner_agency?: string;
  contact?: number;
  driver_contact?: number;
  ownershiptype?: string;
  load_capacity?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: number | string | null;
  onEventStatusUpdated?: () => void;
}

const STATUS_STAGES = [
  { key: "ASSIGNED", label: "Assigned", step: 1 },
  { key: "LOADING", label: "Warehouse Loaded", step: 2 },
  { key: "UNLOADING", label: "Installed (Venue Unloaded)", step: 3 },
  { key: "EVENT_LOADING", label: "Uninstalled (Venue Reloaded)", step: 4 },
  { key: "EVENT_UNLOADING", label: "Warehouse Returned", step: 5 },
  { key: "COMPLETED", label: "Completed", step: 6 },
];

export default function VehicleAssign({ isOpen, onClose, id, onEventStatusUpdated }: Props) {
  // Tabs: "assigned" | "new"
  const [activeTab, setActiveTab] = useState<"assigned" | "new">("assigned");

  // Complete Event overall status
  const [eventStatus, setEventStatus] = useState<string>("Pending");
  const [updatingEventStatus, setUpdatingEventStatus] = useState(false);

  // Assigned vehicles state
  const [assignedVehicles, setAssignedVehicles] = useState<AssignedVehicle[]>([]);
  const [selectedMovementIndex, setSelectedMovementIndex] = useState<number>(0);
  const [loadingAssigned, setLoadingAssigned] = useState(false);

  // New assignment form state
  const [type, setType] = useState("");
  const [agentName, setAgentName] = useState("");
  const [vehicleId, setVehicleId] = useState<number | "">("");
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // New assignment fuel & initial loading fields
  const [fuelType, setFuelType] = useState("Diesel");
  const [fuelQuantity, setFuelQuantity] = useState("");
  const [fuelAmount, setFuelAmount] = useState("");
  const [initialLoadingDate, setInitialLoadingDate] = useState("");
  const [initialLoadingLocation, setInitialLoadingLocation] = useState("");
  const [initialLoadingFile, setInitialLoadingFile] = useState<File | null>(null);
  const [submittingNew, setSubmittingNew] = useState(false);

  // Live Stage Upload / Edit Modal
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<{
    stageKey: "loading" | "unloading" | "event_loading" | "event_unloading";
    title: string;
    imageField: string;
    dateField: string;
    locationField: string;
    currentImage: string | null;
    currentDate: string;
    currentLocation: string;
    nextStatus?: string;
  } | null>(null);
  const [stageFile, setStageFile] = useState<File | null>(null);
  const [stageDate, setStageDate] = useState("");
  const [stageLocation, setStageLocation] = useState("");
  const [updatingStage, setUpdatingStage] = useState(false);

  // Fuel edit state for selected assigned vehicle
  const [isEditingFuel, setIsEditingFuel] = useState(false);
  const [editFuelType, setEditFuelType] = useState("");
  const [editFuelQty, setEditFuelQty] = useState("");
  const [editFuelAmt, setEditFuelAmt] = useState("");

  // Full-size image preview lightbox modal
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // LIVE CAMERA STATES
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedBlobFile, setCapturedBlobFile] = useState<File | null>(null);
  const [targetForCamera, setTargetForCamera] = useState<"stage" | "initial">("stage");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch assigned vehicles
  const getAssignedVehicles = async () => {
    if (!id) return;
    try {
      setLoadingAssigned(true);
      const res = await apiClient.get(`/admin/vehicle-movement/event/${id}`);
      const list = res.data?.data || res.data?.results || [];
      setAssignedVehicles(list);
      if (list.length === 0) {
        setActiveTab("new");
      } else {
        if (selectedMovementIndex >= list.length) {
          setSelectedMovementIndex(0);
        }
      }
    } catch (err) {
      console.error("Error fetching assigned vehicles:", err);
    } finally {
      setLoadingAssigned(false);
    }
  };

  // Fetch complete event status
  const fetchEventStatus = async () => {
    if (!id) return;
    try {
      const res = await apiClient.get(`/admin/Events/findByPk/${id}`);
      const ev = res?.data?.data || res?.data?.results;
      if (ev && ev.status !== undefined) {
        setEventStatus(normalizeStatusCode(ev.status));
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
    }
  };

  // Update complete event status
  const handleUpdateEventStatus = async (newStatusCode: string) => {
    if (!id) return;
    try {
      setUpdatingEventStatus(true);
      const res = await apiClient.put(`/admin/Events/updateStatus/${id}`, { status: newStatusCode });
      if (res.data?.status !== false) {
        setEventStatus(newStatusCode);
        toast.success(`Event #${id} marked as ${getStatusLabel(newStatusCode)}!`);
        if (onEventStatusUpdated) onEventStatusUpdated();
      } else {
        toast.error(res.data?.message || "Failed to update event status");
      }
    } catch (err: any) {
      console.error("Error updating event status:", err);
      toast.error(err.response?.data?.message || "Error updating event status");
    } finally {
      setUpdatingEventStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen && id) {
      getAssignedVehicles();
      fetchEventStatus();
    }
  }, [isOpen, id]);

  // Clean camera stream on unmount or when modal closes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Start Camera Stream
  const startCamera = async (facing: "environment" | "user" = cameraFacingMode) => {
    stopCamera();
    setCameraError(null);
    setCapturedPhotoUrl(null);
    setCapturedBlobFile(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      // Fallback: try basic video without facingMode constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setCameraStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play();
        }
      } catch (fallbackErr: any) {
        setCameraError(fallbackErr.message || "Unable to access camera. Please allow camera permissions or upload from files.");
      }
    }
  };

  const openLiveCamera = (target: "stage" | "initial") => {
    setTargetForCamera(target);
    setCameraOpen(true);
    startCamera("environment");
  };

  const closeLiveCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCapturedPhotoUrl(null);
    setCapturedBlobFile(null);
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacingMode === "environment" ? "user" : "environment";
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const filename = `live_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: "image/jpeg" });
          setCapturedBlobFile(file);
          setCapturedPhotoUrl(URL.createObjectURL(blob));
          stopCamera();
        }
      },
      "image/jpeg",
      0.92
    );
  };

  const confirmCapturedPhoto = () => {
    if (!capturedBlobFile) return;

    if (targetForCamera === "initial") {
      setInitialLoadingFile(capturedBlobFile);
      toast.success("Live photo captured for warehouse loading!");
    } else {
      setStageFile(capturedBlobFile);
      toast.success("Live photo captured! Click 'Save & Live Upload' to upload.");
    }
    closeLiveCamera();
  };

  // Fetch agents or owner vehicles for new assignment
  const getVehicleData = async (selectedType: string) => {
    try {
      setVehicleList([]);
      setAgentList([]);
      setLoadingVehicles(true);

      if (selectedType === "AGENT") {
        const res = await apiClient.get("/admin/AgentOwner/agents/find");
        setAgentList(res.data?.data || res.data?.results || []);
      } else if (selectedType === "OWNER") {
        const res = await apiClient.get("/admin/vehicleDetails/agency/find/OWNER");
        const list = res.data?.results || res.data?.data || [];
        setVehicleList(list);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vehicle list");
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Fetch vehicles for selected agent
  const getVehiclesByAgent = async (name: string) => {
    if (!name) {
      setVehicleList([]);
      return;
    }
    try {
      setLoadingVehicles(true);
      const res = await apiClient.get(
        `/admin/vehicleDetails/agency/find/AGENT/${encodeURIComponent(name)}`
      );
      setVehicleList(res.data?.results || res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load agent vehicles");
    } finally {
      setLoadingVehicles(false);
    }
  };

  if (!isOpen) return null;

  const currentMovement: AssignedVehicle | undefined = assignedVehicles[selectedMovementIndex];
  const selectedNewVehicle = vehicleList.find((v) => v.id === Number(vehicleId)) || null;

  // Handle Create New Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      toast.error("Please select Ownership Type (Owner or Agent)");
      return;
    }
    if (type === "AGENT" && !agentName) {
      toast.error("Please select an Agent");
      return;
    }
    if (!vehicleId) {
      toast.error("Please select a Vehicle");
      return;
    }
    if (!id) {
      toast.error("Event ID is missing. Please select an event from the table.");
      return;
    }

    try {
      setSubmittingNew(true);
      const formData = new FormData();
      formData.append("event_id", String(id));
      formData.append("type", type);
      formData.append("vehicle_id", String(vehicleId));
      formData.append("agent_name", type === "AGENT" ? agentName : selectedNewVehicle?.owner_agency || "Owner");
      formData.append("fuel_type", fuelType);
      formData.append("fuel_quantity", fuelQuantity || "0");
      formData.append("fuel_amount", fuelAmount || "0");

      if (initialLoadingDate) {
        formData.append("loading_datetime", initialLoadingDate);
      }
      if (initialLoadingLocation) {
        formData.append("loading_location", initialLoadingLocation);
      }
      if (initialLoadingFile) {
        formData.append("loading_image", initialLoadingFile);
        formData.append("status", "LOADING");
      } else {
        formData.append("status", "ASSIGNED");
      }

      const res = await apiClient.post("/admin/vehicle-movement/create", formData);

      if (res.data?.success === false) {
        toast.error(res.data?.message || "Failed to assign vehicle");
      } else {
        toast.success("Vehicle Assigned Successfully!");
        // Reset form
        setVehicleId("");
        setFuelQuantity("");
        setFuelAmount("");
        setInitialLoadingDate("");
        setInitialLoadingLocation("");
        setInitialLoadingFile(null);
        await getAssignedVehicles();
        setActiveTab("assigned");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error assigning vehicle");
    } finally {
      setSubmittingNew(false);
    }
  };

  // Handle Quick Status Change
  const handleStatusChange = async (movementId: number, newStatus: string) => {
    try {
      await apiClient.put(`/admin/vehicle-movement/status/${movementId}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      getAssignedVehicles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // Open Stage Modal
  const openStageEditor = (
    stageKey: "loading" | "unloading" | "event_loading" | "event_unloading",
    title: string,
    imageField: string,
    dateField: string,
    locationField: string,
    currentImage: string | null,
    currentDate: string | null,
    currentLocation: string | null,
    nextStatus?: string,
    immediateLiveCamera?: boolean
  ) => {
    setEditingStage({
      stageKey,
      title,
      imageField,
      dateField,
      locationField,
      currentImage,
      currentDate: currentDate ? currentDate.substring(0, 16) : "",
      currentLocation: currentLocation || "",
      nextStatus,
    });
    setStageDate(currentDate ? currentDate.substring(0, 16) : new Date().toISOString().substring(0, 16));
    setStageLocation(currentLocation || "");
    setStageFile(null);
    setStageModalOpen(true);

    if (immediateLiveCamera) {
      openLiveCamera("stage");
    }
  };

  // Submit Stage Update with Live Image Upload
  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMovement || !editingStage) return;

    try {
      setUpdatingStage(true);
      const formData = new FormData();
      if (stageDate) {
        formData.append(editingStage.dateField, stageDate);
      }
      if (stageLocation) {
        formData.append(editingStage.locationField, stageLocation);
      }
      if (stageFile) {
        formData.append(editingStage.imageField, stageFile);
      }
      if (editingStage.nextStatus) {
        formData.append("status", editingStage.nextStatus);
      }

      const res = await apiClient.put(`/admin/vehicle-movement/update/${currentMovement.id}`, formData);

      if (res.data?.success === false) {
        toast.error(res.data?.message || "Failed to update stage data");
      } else {
        toast.success(`${editingStage.title} photo & data saved successfully!`);
        setStageModalOpen(false);
        setEditingStage(null);
        getAssignedVehicles();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload stage data");
    } finally {
      setUpdatingStage(false);
    }
  };

  // Handle Save Fuel Details
  const handleSaveFuel = async () => {
    if (!currentMovement) return;
    try {
      await apiClient.put(`/admin/vehicle-movement/update/${currentMovement.id}`, {
        fuel_type: editFuelType,
        fuel_quantity: editFuelQty || 0,
        fuel_amount: editFuelAmt || 0,
      });
      toast.success("Fuel details updated successfully!");
      setIsEditingFuel(false);
      getAssignedVehicles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update fuel details");
    }
  };

  // Remove Vehicle Assignment
  const handleRemoveAssignment = async (movementId: number) => {
    if (!window.confirm("Are you sure you want to remove this assigned vehicle? All movement logs will be deleted.")) return;
    try {
      await apiClient.delete(`/admin/vehicle-movement/delete/${movementId}`);
      toast.success("Vehicle assignment removed successfully!");
      getAssignedVehicles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove assignment");
    }
  };

  const getImageUrl = (filename: string | null) => {
    if (!filename) return null;
    if (filename.startsWith("http://") || filename.startsWith("https://")) return filename;
    return `${images.baseUrl}/${filename}`;
  };

  const formatDateTime = (dtStr: string | null | undefined) => {
    if (!dtStr) return "Not Recorded";
    try {
      const dt = new Date(dtStr);
      return dt.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dtStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 p-3 sm:p-5">
      <div className="bg-white dark:bg-gray-900 w-full max-w-6xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Truck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                Vehicle Assignment & Live Movement Tracker
                {id ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    Event #{id}
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    Select Event First
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track live vehicle movement, fuel logs, installation & uninstalling live camera photos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Event Status Controls */}
            {id && (
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800/90 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden sm:inline">
                  Event Status:
                </span>
                <select
                  value={normalizeStatusCode(eventStatus)}
                  disabled={updatingEventStatus}
                  onChange={(e) => handleUpdateEventStatus(e.target.value)}
                  className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition cursor-pointer focus:outline-none ${getStatusBadgeClass(eventStatus)}`}
                >
                  {EVENT_STATUSES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.label}
                    </option>
                  ))}
                </select>

                {normalizeStatusCode(eventStatus) !== "3" && (
                  <button
                    onClick={() => handleUpdateEventStatus("3")}
                    disabled={updatingEventStatus}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
                    title="Mark Event as Event Finished (Complete Event)"
                  >
                    <CheckCircle2 size={13} />
                    <span className="hidden md:inline">Finish Event</span>
                  </button>
                )}
                {updatingEventStatus && <RefreshCw size={13} className="animate-spin text-blue-600" />}
              </div>
            )}

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-6 pt-3 bg-white dark:bg-gray-900">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "assigned"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Truck size={17} />
            Assigned Fleet & Live Stages
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold">
              {assignedVehicles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "new"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Plus size={17} />
            Assign New Vehicle
          </button>

          <div className="ml-auto pb-3">
            <button
              onClick={getAssignedVehicles}
              title="Refresh tracking data"
              className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={16} className={loadingAssigned ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* TAB 1: Assigned Vehicles & Live Stages Tracker */}
          {activeTab === "assigned" && (
            <div>
              {loadingAssigned ? (
                <div className="py-20 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                  <RefreshCw className="animate-spin text-blue-600" size={32} />
                  <p>Loading vehicle movements...</p>
                </div>
              ) : assignedVehicles.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8">
                  <Truck size={48} className="mx-auto text-gray-400 mb-3 opacity-60" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                    No Vehicles Assigned Yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    Assign an owner or agency vehicle to track loading, venue install time, uninstalling time, and take live photos.
                  </p>
                  <button
                    onClick={() => setActiveTab("new")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all"
                  >
                    <Plus size={18} />
                    Assign Vehicle Now
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Assigned Vehicles Selector Pills */}
                  {assignedVehicles.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {assignedVehicles.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedMovementIndex(idx)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                            selectedMovementIndex === idx
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <Truck size={14} />
                          {item.vehicle_number || "Vehicle"} ({item.type || "Owner"})
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                            {item.status || "ASSIGNED"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {currentMovement && (
                    <>
                      {/* Vehicle Header & Current Status Bar */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/70 border border-blue-100 dark:border-gray-700 rounded-2xl p-5 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                              {currentMovement.vehicle_number?.substring(0, 2) || "VH"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                  {currentMovement.vehicle_number || "Unregistered"}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                  {currentMovement.type || "OWNER"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                                {currentMovement.name ? `${currentMovement.name} • ` : ""}
                                Owner/Agency: <span className="font-semibold">{currentMovement.agent_name || currentMovement.owner_agency || "N/A"}</span>
                                {currentMovement.driver_contact ? ` • Driver Contact: ${currentMovement.driver_contact}` : ""}
                              </p>
                            </div>
                          </div>

                          {/* Quick Workflow Status Selector & Delete */}
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Workflow Status
                              </span>
                              <select
                                className="h-9 text-xs font-semibold rounded-lg px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500"
                                value={currentMovement.status}
                                onChange={(e) => handleStatusChange(currentMovement.id, e.target.value)}
                              >
                                {STATUS_STAGES.map((st) => (
                                  <option key={st.key} value={st.key}>
                                    {st.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveAssignment(currentMovement.id)}
                              className="mt-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete this vehicle assignment"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Status Stepper Progression */}
                        <div className="mt-6 pt-4 border-t border-blue-100/80 dark:border-gray-700/80">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                            {STATUS_STAGES.map((stage) => {
                              const currentIndex = STATUS_STAGES.findIndex((s) => s.key === currentMovement.status);
                              const thisIndex = STATUS_STAGES.findIndex((s) => s.key === stage.key);
                              const isCompleted = thisIndex <= currentIndex;
                              const isCurrent = thisIndex === currentIndex;

                              return (
                                <button
                                  type="button"
                                  key={stage.key}
                                  onClick={() => handleStatusChange(currentMovement.id, stage.key)}
                                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    isCurrent
                                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                      : isCompleted
                                      ? "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900"
                                      : "bg-white/60 text-gray-500 border-gray-200 dark:bg-gray-900/40 dark:text-gray-400 dark:border-gray-800"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold opacity-75">STEP {stage.step}</span>
                                    {isCompleted && <CheckCircle2 size={12} className={isCurrent ? "text-white" : "text-blue-600 dark:text-blue-400"} />}
                                  </div>
                                  <p className="text-xs font-semibold leading-tight line-clamp-2">
                                    {stage.label}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Fuel Details Card */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800 shadow-xs">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Fuel size={18} className="text-amber-500" />
                            Fuel & Travel Expense Details
                          </h4>
                          {!isEditingFuel ? (
                            <button
                              type="button"
                              onClick={() => {
                                setEditFuelType(currentMovement.fuel_type || "Diesel");
                                setEditFuelQty(currentMovement.fuel_quantity ? String(currentMovement.fuel_quantity) : "");
                                setEditFuelAmt(currentMovement.fuel_amount ? String(currentMovement.fuel_amount) : "");
                                setIsEditingFuel(true);
                              }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                            >
                              <Edit3 size={14} />
                              Edit Fuel
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingFuel(false)}
                                className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveFuel}
                                className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                              >
                                Save
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditingFuel ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Fuel Type</span>
                              <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                                {currentMovement.fuel_type || "Not Specified"}
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Quantity</span>
                              <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                                {currentMovement.fuel_quantity ? `${currentMovement.fuel_quantity} Liters` : "0 Liters"}
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
                              <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                                ₹{currentMovement.fuel_amount ? Number(currentMovement.fuel_amount).toLocaleString("en-IN") : "0"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div>
                              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Fuel Type</label>
                              <select
                                className="w-full text-xs h-9 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-2.5"
                                value={editFuelType}
                                onChange={(e) => setEditFuelType(e.target.value)}
                              >
                                <option value="Diesel">Diesel</option>
                                <option value="Petrol">Petrol</option>
                                <option value="CNG">CNG</option>
                                <option value="Electric">Electric</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Fuel Quantity (Liters)</label>
                              <input
                                type="number"
                                className="w-full text-xs h-9 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-2.5"
                                placeholder="0"
                                value={editFuelQty}
                                onChange={(e) => setEditFuelQty(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Fuel Amount (₹)</label>
                              <input
                                type="number"
                                className="w-full text-xs h-9 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-2.5"
                                placeholder="0"
                                value={editFuelAmt}
                                onChange={(e) => setEditFuelAmt(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4 LIVE STAGES WITH CAMERA CAPTURE, PHOTOS, DATES & LOCATIONS */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Camera size={18} className="text-blue-600" />
                            Live Installation & Uninstalling Stages (Take Live Photos)
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Take real-time live photos with camera or upload from files
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* STAGE 1: Warehouse Loading */}
                          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4.5 bg-white dark:bg-gray-800 flex flex-col justify-between shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                                    1
                                  </span>
                                  <h5 className="font-bold text-sm text-gray-800 dark:text-white">
                                    Warehouse Loading (Dispatch)
                                  </h5>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  currentMovement.loading_image ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}>
                                  {currentMovement.loading_image ? "Photo Uploaded" : "Pending Photo"}
                                </span>
                              </div>

                              {/* Photo Preview / Placeholder */}
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 mb-3 border border-gray-100 dark:border-gray-700/50 flex items-center justify-center group">
                                {currentMovement.loading_image ? (
                                  <>
                                    <img
                                      src={getImageUrl(currentMovement.loading_image) || ""}
                                      alt="Warehouse Loading"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div
                                      onClick={() => setPreviewImage({
                                        url: getImageUrl(currentMovement.loading_image) || "",
                                        title: "Warehouse Loading Photo",
                                      })}
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-medium gap-1 text-xs"
                                    >
                                      <Eye size={16} /> Click to View
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center p-4 text-gray-400">
                                    <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                                    <p className="text-xs">No Loading Image Yet</p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={13} className="text-gray-400 shrink-0" />
                                  <span className="font-medium">{formatDateTime(currentMovement.loading_datetime)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={13} className="text-gray-400 shrink-0" />
                                  <span className="truncate">{currentMovement.loading_location || "Location not recorded"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => openStageEditor(
                                  "loading",
                                  "Warehouse Loading",
                                  "loading_image",
                                  "loading_datetime",
                                  "loading_location",
                                  currentMovement.loading_image,
                                  currentMovement.loading_datetime,
                                  currentMovement.loading_location,
                                  "LOADING",
                                  true // Open live camera immediately
                                )}
                                className="py-2 px-3 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Camera size={14} />
                                Take Live Photo
                              </button>

                              <button
                                type="button"
                                onClick={() => openStageEditor(
                                  "loading",
                                  "Warehouse Loading",
                                  "loading_image",
                                  "loading_datetime",
                                  "loading_location",
                                  currentMovement.loading_image,
                                  currentMovement.loading_datetime,
                                  currentMovement.loading_location,
                                  "LOADING",
                                  false
                                )}
                                className="py-2 px-3 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Upload size={14} />
                                Upload File
                              </button>
                            </div>
                          </div>

                          {/* STAGE 2: Installation Time (Venue Unloading) */}
                          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4.5 bg-white dark:bg-gray-800 flex flex-col justify-between shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                                    2
                                  </span>
                                  <div>
                                    <h5 className="font-bold text-sm text-gray-800 dark:text-white">
                                      Install Time (Venue Unloading)
                                    </h5>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  currentMovement.unloading_image ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}>
                                  {currentMovement.unloading_image ? "Install Photo Uploaded" : "Pending Photo"}
                                </span>
                              </div>

                              {/* Photo Preview / Placeholder */}
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 mb-3 border border-gray-100 dark:border-gray-700/50 flex items-center justify-center group">
                                {currentMovement.unloading_image ? (
                                  <>
                                    <img
                                      src={getImageUrl(currentMovement.unloading_image) || ""}
                                      alt="Install Time Unloading"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div
                                      onClick={() => setPreviewImage({
                                        url: getImageUrl(currentMovement.unloading_image) || "",
                                        title: "Installation Time (Venue Unloading) Photo",
                                      })}
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-medium gap-1 text-xs"
                                    >
                                      <Eye size={16} /> Click to View
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center p-4 text-gray-400">
                                    <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                                    <p className="text-xs">No Install Time Image Yet</p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={13} className="text-gray-400 shrink-0" />
                                  <span className="font-medium">{formatDateTime(currentMovement.unloading_datetime)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={13} className="text-gray-400 shrink-0" />
                                  <span className="truncate">{currentMovement.unloading_location || "Event Venue not set"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => openStageEditor(
                                  "unloading",
                                  "Install Time (Venue Unloading)",
                                  "unloading_image",
                                  "unloading_datetime",
                                  "unloading_location",
                                  currentMovement.unloading_image,
                                  currentMovement.unloading_datetime,
                                  currentMovement.unloading_location,
                                  "UNLOADING",
                                  true // Open live camera immediately
                                )}
                                className="py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Camera size={14} />
                                Take Live Photo
                              </button>

                              <button
                                type="button"
                                onClick={() => openStageEditor(
                                  "unloading",
                                  "Install Time (Venue Unloading)",
                                  "unloading_image",
                                  "unloading_datetime",
                                  "unloading_location",
                                  currentMovement.unloading_image,
                                  currentMovement.unloading_datetime,
                                  currentMovement.unloading_location,
                                  "UNLOADING",
                                  false
                                )}
                                className="py-2 px-3 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Upload size={14} />
                                Upload File
                              </button>
                            </div>
                          </div>

                          {/* STAGE 3: Uninstalling Time (Venue Reloading) */}
                          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4.5 bg-white dark:bg-gray-800 flex flex-col justify-between shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                                    3
                                  </span>
                                  <div>
                                    <h5 className="font-bold text-sm text-gray-800 dark:text-white">
                                      Uninstalling Time (Venue Loading)
                                    </h5>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  currentMovement.event_loading_image ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}>
                                  {currentMovement.event_loading_image ? "Uninstall Photo Uploaded" : "Pending Photo"}
                                </span>
                              </div>

                              {/* Photo Preview / Placeholder */}
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 mb-3 border border-gray-100 dark:border-gray-700/50 flex items-center justify-center group">
                                {currentMovement.event_loading_image ? (
                                  <>
                                    <img
                                      src={getImageUrl(currentMovement.event_loading_image) || ""}
                                      alt="Uninstalling Time Loading"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div
                                      onClick={() => setPreviewImage({
                                        url: getImageUrl(currentMovement.event_loading_image) || "",
                                        title: "Uninstalling Time (Venue Reloading) Photo",
                                      })}
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-medium gap-1 text-xs"
                                    >
                                      <Eye size={16} /> Click to View
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center p-4 text-gray-400">
                                    <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                                    <p className="text-xs">No Uninstalling Image Yet</p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={13} className="text-gray-400 shrink-0" />
                                  <span className="font-medium">{formatDateTime(currentMovement.event_loading_datetime)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={13} className="text-gray-400 shrink-0" />
                                  <span className="truncate">{currentMovement.event_loading_location || "Venue pickup location not set"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => openStageEditor(
                                  "event_loading",
                                  "Uninstalling Time (Venue Reloading)",
                                  "event_loading_image",
                                  "event_loading_datetime",
                                  "event_loading_location",
                                  currentMovement.event_loading_image,
                                  currentMovement.event_loading_datetime,
                                  currentMovement.event_loading_location,
                                  "EVENT_LOADING",
                                  true // Open live camera immediately
                                )}
                                className="py-2 px-3 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Camera size={14} />
                                Take Live Photo
                              </button>

                              <button
                                type="button"
                                onClick={() => openStageEditor(
                                  "event_loading",
                                  "Uninstalling Time (Venue Reloading)",
                                  "event_loading_image",
                                  "event_loading_datetime",
                                  "event_loading_location",
                                  currentMovement.event_loading_image,
                                  currentMovement.event_loading_datetime,
                                  currentMovement.event_loading_location,
                                  "EVENT_LOADING",
                                  false
                                )}
                                className="py-2 px-3 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Upload size={14} />
                                Upload File
                              </button>
                            </div>
                          </div>

                          {/* STAGE 4: Warehouse Return Unloading */}
                          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4.5 bg-white dark:bg-gray-800 flex flex-col justify-between shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-bold text-xs flex items-center justify-center">
                                    4
                                  </span>
                                  <div>
                                    <h5 className="font-bold text-sm text-gray-800 dark:text-white">
                                      Warehouse Return Unloading
                                    </h5>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  currentMovement.event_unloading_image ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}>
                                  {currentMovement.event_unloading_image ? "Return Photo Uploaded" : "Pending Photo"}
                                </span>
                              </div>

                              {/* Photo Preview / Placeholder */}
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 mb-3 border border-gray-100 dark:border-gray-700/50 flex items-center justify-center group">
                                {currentMovement.event_unloading_image ? (
                                  <>
                                    <img
                                      src={getImageUrl(currentMovement.event_unloading_image) || ""}
                                      alt="Warehouse Return Unloading"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div
                                      onClick={() => setPreviewImage({
                                        url: getImageUrl(currentMovement.event_unloading_image) || "",
                                        title: "Warehouse Return Unloading Photo",
                                      })}
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-medium gap-1 text-xs"
                                    >
                                      <Eye size={16} /> Click to View
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center p-4 text-gray-400">
                                    <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                                    <p className="text-xs">No Return Image Yet</p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={13} className="text-gray-400 shrink-0" />
                                  <span className="font-medium">{formatDateTime(currentMovement.event_unloading_datetime)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={13} className="text-gray-400 shrink-0" />
                                  <span className="truncate">{currentMovement.event_unloading_location || "Warehouse destination not set"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => openStageEditor(
                                  "event_unloading",
                                  "Warehouse Return Unloading",
                                  "event_unloading_image",
                                  "event_unloading_datetime",
                                  "event_unloading_location",
                                  currentMovement.event_unloading_image,
                                  currentMovement.event_unloading_datetime,
                                  currentMovement.event_unloading_location,
                                  "EVENT_UNLOADING",
                                  true // Open live camera immediately
                                )}
                                className="py-2 px-3 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Camera size={14} />
                                Take Live Photo
                              </button>

                              <button
                                type="button"
                                onClick={() => openStageEditor(
                                  "event_unloading",
                                  "Warehouse Return Unloading",
                                  "event_unloading_image",
                                  "event_unloading_datetime",
                                  "event_unloading_location",
                                  currentMovement.event_unloading_image,
                                  currentMovement.event_unloading_datetime,
                                  currentMovement.event_unloading_location,
                                  "EVENT_UNLOADING",
                                  false
                                )}
                                className="py-2 px-3 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Upload size={14} />
                                Upload File
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Assign New Vehicle Form */}
          {activeTab === "new" && (
            <form onSubmit={handleCreateAssignment} className="space-y-6">
              {/* Step 1: Vehicle Selection */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800 space-y-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Truck size={18} className="text-blue-600" />
                  Step 1: Select Vehicle & Ownership
                </h4>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Ownership Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                      value={type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setType(val);
                        setAgentName("");
                        setVehicleId("");
                        getVehicleData(val);
                      }}
                      required
                    >
                      <option value="">Select Ownership Type</option>
                      <option value="OWNER">Owner Vehicle</option>
                      <option value="AGENT">Agency / Vendor Vehicle</option>
                    </select>
                  </div>

                  {/* Agent (if AGENT) */}
                  {type === "AGENT" && (
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Select Agent <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                        value={agentName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAgentName(val);
                          setVehicleId("");
                          getVehiclesByAgent(val);
                        }}
                        required
                      >
                        <option value="">Select Agent</option>
                        {agentList.map((ag) => (
                          <option key={ag.id} value={ag.name}>
                            {ag.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Vehicle Dropdown */}
                  {(type === "OWNER" || (type === "AGENT" && agentName)) && (
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Select Vehicle <span className="text-red-500">*</span>
                        {loadingVehicles ? " (Loading...)" : ` (${vehicleList.length} available)`}
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                        value={vehicleId}
                        onChange={(e) => setVehicleId(e.target.value ? Number(e.target.value) : "")}
                        required
                      >
                        <option value="">Select Vehicle</option>
                        {vehicleList.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.vehicle_number ? `${v.vehicle_number} (${v.name})` : v.name}
                          </option>
                        ))}
                      </select>
                      {vehicleList.length === 0 && !loadingVehicles && (
                        <p className="text-xs text-amber-600 mt-1">
                          No vehicles found for {type === "OWNER" ? "Owner" : agentName}.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Vehicle Card Preview */}
                {selectedNewVehicle && (
                  <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-gray-500">Vehicle Name:</span>
                        <p className="font-bold text-gray-800 dark:text-white">{selectedNewVehicle.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Vehicle Number:</span>
                        <p className="font-bold text-gray-800 dark:text-white">{selectedNewVehicle.vehicle_number}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Load Capacity:</span>
                        <p className="font-bold text-gray-800 dark:text-white">
                          {selectedNewVehicle.load_capacity ? `${selectedNewVehicle.load_capacity} Ton` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Driver Contact:</span>
                        <p className="font-bold text-gray-800 dark:text-white">{selectedNewVehicle.driver_contact || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Fuel Details */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800 space-y-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Fuel size={18} className="text-amber-500" />
                  Step 2: Fuel & Expense Details (Optional)
                </h4>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Fuel Type
                    </label>
                    <select
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Fuel Quantity (Liters)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 25"
                      value={fuelQuantity}
                      onChange={(e) => setFuelQuantity(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Fuel Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 2500"
                      value={fuelAmount}
                      onChange={(e) => setFuelAmount(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Initial Warehouse Loading Photo & Details */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800 space-y-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Camera size={18} className="text-emerald-500" />
                  Step 3: Initial Warehouse Loading Details & Live Photo (Optional)
                </h4>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Loading Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                      value={initialLoadingDate}
                      onChange={(e) => setInitialLoadingDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Loading Location
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Main Warehouse Hub"
                      value={initialLoadingLocation}
                      onChange={(e) => setInitialLoadingLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Warehouse Loading Photo
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openLiveCamera("initial")}
                        className="flex-1 h-11 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-colors"
                      >
                        <Camera size={16} />
                        Take Live Photo
                      </button>

                      <label className="flex-1 h-11 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-gray-300 dark:border-gray-700 transition-colors">
                        <Upload size={16} />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => setInitialLoadingFile(e.target.files ? e.target.files[0] : null)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {initialLoadingFile && (
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl flex items-center justify-between border border-blue-200 dark:border-blue-900/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={URL.createObjectURL(initialLoadingFile)}
                        alt="Selected Loading Preview"
                        className="h-14 w-14 object-cover rounded-lg border border-blue-200"
                      />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                          {initialLoadingFile.name}
                        </p>
                        <p className="text-[11px] text-blue-700 dark:text-blue-400">
                          {(initialLoadingFile.size / 1024).toFixed(1)} KB • Ready to save with assignment
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInitialLoadingFile(null)}
                      className="text-red-500 hover:text-red-700 p-2 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                {assignedVehicles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("assigned")}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-colors"
                  >
                    Back to Assigned Fleet
                  </button>
                )}

                <button
                  type="submit"
                  disabled={submittingNew || !vehicleId}
                  className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {submittingNew ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Assigning Vehicle...
                    </>
                  ) : (
                    <>
                      <Truck size={16} />
                      Assign Vehicle Now
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-3.5 bg-gray-50/80 dark:bg-gray-900/80 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div>
            Total Assigned Vehicles for Event: <span className="font-bold text-gray-700 dark:text-gray-200">{assignedVehicles.length}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* LIVE CAMERA CAPTURE MODAL */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-9999999 p-4">
          <div className="bg-gray-900 text-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-800">
            {/* Camera Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-900/90 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Camera size={20} className="text-blue-400" />
                <h3 className="font-bold text-base">
                  Take Live Photo (Installation & Movements)
                </h3>
              </div>
              <button
                onClick={closeLiveCamera}
                className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Viewfinder / Video Feed */}
            <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-red-400 space-y-3">
                  <p className="text-sm font-semibold">{cameraError}</p>
                  <p className="text-xs text-gray-400">
                    You can still upload a photo using your device's camera file picker.
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer">
                    <Camera size={16} />
                    Open Device Camera File Picker
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          if (targetForCamera === "initial") {
                            setInitialLoadingFile(e.target.files[0]);
                          } else {
                            setStageFile(e.target.files[0]);
                          }
                          closeLiveCamera();
                          toast.success("Photo selected from device!");
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : capturedPhotoUrl ? (
                // Captured Photo Freeze Frame Preview
                <img
                  src={capturedPhotoUrl}
                  alt="Captured Frame"
                  className="w-full h-full object-cover"
                />
              ) : (
                // Live Viewfinder
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {/* Viewfinder Guidelines Overlay (when live) */}
              {!capturedPhotoUrl && !cameraError && (
                <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                  <div className="flex justify-between text-[11px] text-white/70 font-mono">
                    <span>LIVE VIEW</span>
                    <span>1080P HD</span>
                  </div>
                  <div className="text-center text-xs text-white/70 font-medium">
                    Position installation or vehicle in frame
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="p-5 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
              {capturedPhotoUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => startCamera(cameraFacingMode)}
                    className="px-5 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw size={16} />
                    Retake Photo
                  </button>

                  <button
                    type="button"
                    onClick={confirmCapturedPhoto}
                    className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Check size={16} />
                    Use This Photo
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    className="p-3 rounded-xl border border-gray-800 hover:bg-gray-800 text-gray-300 transition-colors"
                    title="Switch Camera (Front / Back)"
                  >
                    <SwitchCamera size={20} />
                  </button>

                  {/* Big Circular Capture Button */}
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!!cameraError}
                    className="h-16 w-16 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center p-1 border-4 border-gray-400 shadow-xl active:scale-95 transition-all"
                    title="Capture Photo"
                  >
                    <div className="h-12 w-12 rounded-full bg-white border-2 border-black/20 flex items-center justify-center">
                      <Camera size={22} className="text-gray-900" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={closeLiveCamera}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LIVE STAGE UPDATE & PHOTO UPLOAD MODAL */}
      {stageModalOpen && editingStage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-999999 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Camera size={18} className="text-blue-600" />
                Live Photo & Details: {editingStage.title}
              </h3>
              <button
                onClick={() => setStageModalOpen(false)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="space-y-4">
              {/* Photo Source Options: Live Camera vs File Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Photo for this Stage
                </label>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => openLiveCamera("stage")}
                    className="h-11 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Camera size={16} />
                    Open Live Camera
                  </button>

                  <label className="h-11 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border border-gray-300 dark:border-gray-700 transition-colors">
                    <Upload size={16} />
                    Device / File
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => setStageFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Show current image or selected preview */}
                <div className="aspect-video rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center relative">
                  {stageFile ? (
                    <img
                      src={URL.createObjectURL(stageFile)}
                      alt="New selection preview"
                      className="w-full h-full object-cover"
                    />
                  ) : editingStage.currentImage ? (
                    <img
                      src={getImageUrl(editingStage.currentImage) || ""}
                      alt="Current stage photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      <Camera size={32} className="mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No image selected. Take a live photo or upload from device.</p>
                    </div>
                  )}
                  {stageFile && (
                    <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Check size={12} /> New Photo Ready
                    </span>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Stage Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-10 px-3 text-xs focus:ring-2 focus:ring-blue-500"
                  value={stageDate}
                  onChange={(e) => setStageDate(e.target.value)}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Location (Venue / Warehouse Site)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hotel Grand Hall, Gate 2"
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl h-10 px-3 text-xs focus:ring-2 focus:ring-blue-500"
                  value={stageLocation}
                  onChange={(e) => setStageLocation(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setStageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStage}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {updatingStage ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Save & Live Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL IMAGE LIGHTBOX MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-9999999 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
              <h4 className="font-bold text-sm text-gray-800 dark:text-white">
                {previewImage.title}
              </h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-500 hover:text-red-500 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-black/5 dark:bg-black/40">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}