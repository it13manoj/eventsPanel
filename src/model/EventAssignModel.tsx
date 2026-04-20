import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



export default function EventAssignModel({ eid, isOpen, closeModal }: any) {
  if (!isOpen) return null;
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [users, setUsers] = useState([{
    id: 0,
   name:""
  }])

  const [categories, setCategories] = useState([{
    id: "",
    name: ""
  }]);
  const [subCategories, setSubCategories] = useState([{
    id: "",
    name: ""
  }]);

  const [events, setEvents] = useState({
    "id": 1,
    "c_name": "Manoj",
    "vanus": "Test",
    "doe": "2026-04-05T00:00:00.000Z",
    "v_location": "test",
    "v_a_d": "2026-04-18T09:25:00.000Z",
    "nodb": 6,
    "pob": "buxar",
    "tc": "0",
    "sr": "test",
    "amount": 0,
    "status": "1",
    "created_at": "2026-04-18T05:53:13.000Z",
    "updated_at": "2026-04-18T05:53:13.000Z"
  })
  // const [inventory, setInventory] = useState({})
  const [wareHouse, setWarehouse] = useState([{
    id: "",
     WareHouse:{address: ""}
  }])
  const [getCateData, setCatDate] = useState({
    categories_id: "",
    sub_categories_id: ""
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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

  const getCategories = async () => {
    try {
      const results = await apiClient.get("/admin/category/find");
      setCategories(results?.data?.results)

    } catch {

    }
  }
  useEffect(() => {
    getCategories();
  }, [])


  const eventHandler = async (e: any) => {
    try {
      const id = e.target.value;
      const results = await apiClient.get(`/admin/subCategory/findByid/${id}`)
      setSubCategories(results?.data?.results)
    } catch {

    }


  }
  console.log(eid?.id);



  const getEvents = async (eid: any) => {


    if (eid) {
      const results = await apiClient.get(`/admin/Events/findByPk/${eid?.id}`)
      setEvents(results?.data?.results)

    }
  }

  useEffect(() => {
    getEvents(eid)
  }, [isOpen])



  useEffect(() => {
    if (events?.v_a_d) {
      setDate(new Date(events.v_a_d)); // convert string → Date object
    }
  }, [events]);

  useEffect(() => {
    if (events?.v_a_d) {
      setTime(new Date(events.v_a_d)); // convert string → Date object
    }
  }, [events]);


  const selectHendler = (e: any) => {
    setCatDate(preState => ({ ...preState, [e.target.name]: e.target.value }))
  }

  const fetchStock = async (cid:any, sid:any) => {
    if (cid && sid){
      const results = await apiClient.get(`/admin/Inverntory/findBycategoriesAndSubCategories/${cid}/${sid}`)
     setWarehouse(results.data.results)
       
    }
  }

  useEffect(() => {
    fetchStock(getCateData.categories_id, getCateData.sub_categories_id)
  }, [getCateData.categories_id, getCateData.sub_categories_id])





  const selectedNames = users
    .filter((cat) => selected.includes(cat.id))
    .map((cat) => cat?.name)
    .join(", ");
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[100%] p-6 lg:p-10">
      <div className="overflow-y-auto custom-scrollbar">
        <div>
          <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
            {"Team Assign"}
          </h5>
        </div>

        {/* Form: 2-column grid */}
        <form >
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Select Employee
              </label>
              <div className="relative w-full">

                {/* Selector */}
                <div
                  onClick={() => setOpen(!open)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs cursor-pointer flex items-center justify-between"
                >
                  <span>
                    {selected.length > 0 ? selectedNames : " Select Employee"}
                  </span>
                  <span>▼</span>
                </div>

                {/* Dropdown */}
                {open && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                    {users && users.map((rows) => (
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Inventory Category
              </label>
              <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="categories_id" onChange={(e: any) => {
                eventHandler(e);
                selectHendler(e)
              }}>
                <option value={0}> Select Inventory Category</option>

                {categories && categories?.map(rows => (
                  <option value={rows?.id}> {rows.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Goods
              </label>
              <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="sub_categories_id" onChange={(e: any) => {
                selectHendler(e)
              }}>
                <option value={0}> Select Goods </option>
                {subCategories && subCategories.map(rows => (
                  <option value={rows?.id}>{rows.name}</option>
                ))}
              </select>
            </div>



            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Date
                </label>
                <DatePicker
                  selected={date}
                  onChange={(d: any) => setDate(d)}
                  dateFormat="yyyy-MM-dd"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"

                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Time
                </label>
                <DatePicker
                  selected={time}
                  onChange={(t: any) => setTime(t)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"

                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>

          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">


            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Venue
              </label>
              <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="height" value={`${events?.vanus}`} />

            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Location
              </label>
              <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="quantity" value={`${events?.v_location}`} />

            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Installation and Uninstalling Time Day/Night:
              </label>
              <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="price" />

            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Stock Location
              </label>
              <select className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="quality" >
                <option >Select Store Location</option>
                    {wareHouse && wareHouse.map(rows=>(
                      <option key={rows.id} value={rows.id} >{rows?.WareHouse?.address?.toUpperCase()}</option>
                    ))}
                </select>
            </div>
          </div>



          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Close
            </button>
            <button

              type="submit"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {"Submit"}
            </button>
          </div>
        </form>
      </div>


    </Modal>
  );
}