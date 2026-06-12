import React, { useState, useEffect } from "react";
import apiClient from "../../hooks/api/apiClient";

interface Option {
  id: number;
  name: string;
}

interface Props {
  setSelectedTech: React.Dispatch<React.SetStateAction<string>>;
  designId: any;
}

const AutoComplete: React.FC<Props> = ({ setSelectedTech, designId }) => {
  const [query, setQuery] = useState("");
  const [allData, setAllData] = useState<Option[]>([]); // full API data
  const [filtered, setFiltered] = useState<Option[]>([]);
  const [show, setShow] = useState(false);

console.log(designId);


  // ✅ Fetch data once (or you can call on each search if needed)
  const getData = async () => {
    try {
      const res = await apiClient.get("/admin/Events/Design/find");

      const mapped: Option[] = res.data.results.map((rows: any) => ({
        id: rows.id,
        name: rows.design_name,
      }));

      setAllData(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedTech(value);

    if (value.trim() === "") {
      setFiltered([]);
      setShow(false);
      return;
    }

    let result = allData.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );


    // console.log(result);
    
    setFiltered(result);
    setShow(true);
  };

  useEffect(() => {
  if (designId && allData.length > 0) {
    const selectedDesign = allData.find(
      (item) => item.id === Number(designId)
    );

    if (selectedDesign) {
      setQuery(selectedDesign.name); // Auto-fill input
      setSelectedTech(selectedDesign.name); // Send value to parent
      setFiltered([selectedDesign]); // Optional
      setShow(false); // Hide dropdown initially
    }
  }
}, [designId, allData]);

  // ✅ Handle select
const handleSelect = (item: Option) => {
  setQuery(item.name);
  setSelectedTech(item.name);
  setShow(false);
};
  return (
    <div className="md:col-span-2 relative mt-2">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        Select Design
      </label>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
        className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
      />

      {show && filtered.length > 0 && (
        <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 z-10 max-h-60 overflow-y-auto">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(item)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoComplete;