import { useEffect, useState } from "react";
import apiClient from "../hooks/api/apiClient";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import ReactDatePicker from "react-datepicker";
import { Modal } from "../components/ui/modal";

interface User {
  id: number;
  name: string;
  sifting_type: number;
  base_pay?: number;
}

export default function EventAssignModel({ eid, isOpen, closeModal }: any) {
  if (!isOpen) return null;

  const [installationDate, setInstallationDate] = useState<Date | null>(null);
  const [uninstallationDate, setUninstallationDate] = useState<Date | null>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [employeeDetails, setEmployeeDetails] = useState<{
    [key: number]: {
      shiftType: number | "";
      hours: string;
    };
  }>({});

  const toggleSelect = (id: number) => {
    const employee = users.find((u) => u.id === id);

    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
      const updated = { ...employeeDetails };
      delete updated[id];
      setEmployeeDetails(updated);
    } else {
      setSelected([...selected, id]);
      setEmployeeDetails((prev) => ({
        ...prev,
        [id]: {
          shiftType: employee?.sifting_type ?? "",
          hours: "",
        },
      }));
    }
  };

  const getUsers = async () => {
    try {
      const results = await apiClient.get("/users/all");
      setUsers(results?.data?.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const TeamSubmitHendler = async (e: any) => {
    e.preventDefault();
    try {
      const params = {
        employees: selected,
        installDate: installationDate,
        uninstallation: uninstallationDate,
        event_id: eid?.id,
      };

      await apiClient.post("/admin/teamAssign/create", params);
      toast.success("Team assigned successfully!");
      closeModal();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to assign team");
    }
  };

  const selectedNames = users
    .filter((cat) => selected.includes(cat.id))
    .map((cat) => cat?.name)
    .join(", ");

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal(false)}
      className="max-w-4xl p-6 lg:p-8"
    >
      <div className="overflow-y-auto max-h-[80vh] custom-scrollbar">
        <h5 className="mb-4 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
          Team Assign
        </h5>

        <form onSubmit={TeamSubmitHendler} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Select Employee
              </label>

              <div className="relative">
                <div
                  onClick={() => setOpen(!open)}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <span className="truncate">
                    {selected.length > 0 ? selectedNames : "Select Employee"}
                  </span>
                  <span>▼</span>
                </div>

                {open && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto dark:border-gray-700 dark:bg-gray-800">
                    {users?.map((rows) => (
                      <label
                        key={rows.id}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(rows.id)}
                          onChange={() => toggleSelect(rows.id)}
                          className="accent-brand-500"
                        />
                        {rows?.name?.toUpperCase()}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Installation Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Installation Time
              </label>
              <ReactDatePicker
                selected={installationDate}
                onChange={(date: Date | null) => setInstallationDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy hh:mm aa"
                placeholderText="Select Date & Time"
                minDate={new Date()}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Uninstallation Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Uninstallation Time
              </label>
              <ReactDatePicker
                selected={uninstallationDate}
                onChange={(date: Date | null) => setUninstallationDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy hh:mm aa"
                placeholderText="Select Date & Time"
                minDate={new Date()}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          {selected.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left text-gray-600 dark:text-gray-300">Employee</th>
                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left text-gray-600 dark:text-gray-300">Number of Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {selected.map((id) => {
                    const employee = users.find((u) => u.id === id);
                    return (
                      <tr key={id}>
                        <td className="p-2 font-medium text-gray-800 dark:text-white">
                          {employee?.name}
                        </td>
                        <td className="p-2">
                          <input
                            className="w-full border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                            value={employeeDetails[id]?.shiftType || ""}
                            disabled
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => closeModal(false)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm font-medium"
            >
              Close
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 text-sm font-medium transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}