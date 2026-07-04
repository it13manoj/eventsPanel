import { useState } from "react";
import apiClient from "../hooks/api/apiClient";

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: number | null;
}

export default function VehicleAssign({
  isOpen,
  onClose,
}: Props) {
const [type, setType] = useState("");
const [agentName, setAgentName] = useState("");
const [vehicleId, setVehicleId] = useState<number | "">("");

const [agentList, setAgentList] = useState<Agent[]>([]);
const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);

  if (!isOpen) return null;

  // Get Agents or Owner Vehicles
  const getData = async (selectedType: string) => {
    try {
      setVehicleList([]);
      setAgentList([]);

      if (selectedType === "AGENT") {
        const res = await apiClient.get("/admin/AgentOwner/agents/find");
        setAgentList(res.data.data || []);
      } else {
        const res = await apiClient.get(
          `/admin/vehicleDetails/agency/find/OWNER/null`
        );

        setVehicleList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get Vehicles by Agent
  const getVehicles = async (name: string) => {
    try {
      const res = await apiClient.get(
        `/admin/vehicleDetails/agency/find/AGENT/${name}`
      );

      setVehicleList(res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedVehicle =
    vehicleList.find((item) => item.id === Number(vehicleId)) || null;

  const handleSubmit = () => {
    console.log({
      type,
      agentName,
      vehicleId,
      vehicle: selectedVehicle,
    });

    alert("Vehicle Assigned Successfully");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold">Vehicle Assignment</h2>

          <button
            onClick={onClose}
            className="text-xl hover:text-red-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-5">
            {/* Type */}
            <div>
              <label className="block mb-2 font-medium">
                Select Type
              </label>

              <select
                className="w-full border rounded-lg h-11 px-3"
                value={type}
                onChange={(e) => {
                  const value = e.target.value;

                  setType(value);
                  setAgentName("");
                  setVehicleId("");
                  getData(value);
                }}
              >
                <option value="">Select Type</option>
                <option value="OWNER">Owner</option>
                <option value="AGENT">Agent</option>
              </select>
            </div>

            {/* Agent */}
            {type === "AGENT" && (
              <div>
                <label className="block mb-2 font-medium">
                  Select Agent
                </label>

                <select
                  className="w-full border rounded-lg h-11 px-3"
                  value={agentName}
                  onChange={(e) => {
                    const value = e.target.value;

                    setAgentName(value);
                    setVehicleId("");

                    getVehicles(value);
                  }}
                >
                  <option value="">Select Agent</option>

                  {agentList.map((agent) => (
                    <option
                      key={agent.id}
                      value={agent.name}
                    >
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Vehicle */}
            {(type === "OWNER" || agentName) && (
              <div>
                <label className="block mb-2 font-medium">
                  Select Vehicle
                </label>

                <select
                  className="w-full border rounded-lg h-11 px-3"
                  value={vehicleId}
                  onChange={(e) =>
                    setVehicleId(Number(e.target.value))
                  }
                >
                  <option value="">Select Vehicle</option>

                  {vehicleList.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={vehicle.id}
                    >
                      {vehicle.vehicle_number}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          {selectedVehicle && (
            <div className="mt-8 border rounded-xl bg-gray-50 p-6">
              <h3 className="text-lg font-bold mb-4">
                Vehicle Details
              </h3>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <p className="text-gray-500 text-sm">
                    Vehicle Number
                  </p>
                  <p className="font-semibold">
                    {selectedVehicle.vehicle_number}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Vehicle Name
                  </p>
                  <p className="font-semibold">
                    {selectedVehicle.name}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Ownership Type
                  </p>
                  <p className="font-semibold">
                    {selectedVehicle.ownershiptype}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Owner/Agency
                  </p>
                  <p className="font-semibold">
                    {selectedVehicle.owner_agency}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Contact
                  </p>
                  <p className="font-semibold">
                    {selectedVehicle.contact}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Driver Contact
                  </p>
                  <p className="font-semibold">
                    {selectedVehicle.driver_contact}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Load Capacity
                  </p>
                  <p className="font-semibold">
                    {selectedVehicle.load_capacity}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Commission
                  </p>
                  <p className="font-semibold">
                    {selectedVehicle.commission}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Insurance
                  </p>
                  <p className="font-semibold">
                    {selectedVehicle.insurance}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border hover:bg-gray-100"
            >
              Close
            </button>

            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}