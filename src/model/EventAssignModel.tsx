import { useEffect, useState } from "react";
import apiClient from "../hooks/api/apiClient";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


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


  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  console.log(date, time);


  const [events, setEvents] = useState({
    "id": 1,
    "c_name": "",
    "vanus": "",
    "doe": "",
    "v_location": "",
    "v_a_d": "",
    "nodb": 6,
    "pob": "",
    "tc": "0",
    "sr": "",
    "amount": 0,
    "status": "1",
    "created_at": "",
    "updated_at": ""
  })
  // const [inventory, setInventory] = useState({})


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
      const results = await apiClient.get("/users/all")
      setUsers(results?.data?.results)
    } catch {

    }
  }

  useEffect(() => {
    getUsers()
  }, [0])





  const getEvents = async (eid: any) => {


    if (eid) {
      const results = await apiClient.get(`/admin/Events/findByPk/${eid?.id}`)
      setEvents(results?.data?.results)

      console.log(results?.data?.results.doe);
      // setDate(new Date(results?.data?.results.doe))

    }
  }

  useEffect(() => {
    getEvents(eid)
  }, [isOpen])



  useEffect(() => {
    if (events?.doe) {
      setDate(new Date(events.doe)); // convert string → Date object
    }
  }, [events]);

  useEffect(() => {
    if (events?.v_a_d) {
      setTime(new Date(events.doe)); // convert string → Date object
    }
  }, [events]);


  const TeamSubmitHendler = async (e: any) => {
    e.preventDefault();
    try {
      const params = {
        employees: selected,
        installDate: installationDate,
        uninstallation: uninstallationDate,
        event_id: eid?.id
      }

      const results = await apiClient.post("/admin/teamAssign/create", params)
      toast.success("Successfully Created!", results);
      closeModal();
    } catch (error) {

    }
  }




  const selectedNames = users
    .filter((cat) => selected.includes(cat.id))
    .map((cat) => cat?.name)
    .join(", ");


const [employeeDetails, setEmployeeDetails] = useState<{
  [key: number]: {
    shiftType: number | "";
    hours: string;
  };
}>({});
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" >
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-lg p-6 relative">
        <button
          onClick={() => closeModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        <div>
          <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
            {"Team Assign"}
          </h5>
        </div>
        <ToastContainer
          position="bottom-left"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
        />
        {/* Form: 2-column grid */}
        <form onSubmit={TeamSubmitHendler}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">

            {/* Employee */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Select Employee
              </label>

              <div className="relative">
                <div
                  onClick={() => setOpen(!open)}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer dark:bg-gray-900 dark:text-white"
                >
                  <span>
                    {selected.length > 0 ? selectedNames : "Select Employee"}
                  </span>
                  <span>▼</span>
                </div>

                {open && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-60 overflow-y-auto">
                    {users?.map((rows) => (
                      <label
                        key={rows.id}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(rows.id)}
                          onChange={() => toggleSelect(rows.id)}
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
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white"
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
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div >
            {selected.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Employee</th>
                      <th className="border p-2 text-left">Number of Shift</th>
                      <th className="border p-2 text-left hidden">Hours</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selected.map((id) => {
                      const employee = users.find((u) => u.id === id);

                      return (
                        <tr key={id}>
                          <td className="border p-2 font-medium">
                            {employee?.name}
                          </td>

                          <td className="border p-2">
                            <input
                              className="w-full border rounded px-2 py-1"
                              value={employeeDetails[id]?.shiftType || ""}
                              
                              disabled
                            />
                            
                          </td>

                          <td className="hidden border p-2">
                           
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-end mb-8 mt-8">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="h-11 px-5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="submit"
                className="h-11 px-5 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
              >
                Submit
              </button>
            </div>
          </div>

        </form>
      </div>


    </div>
  );
}