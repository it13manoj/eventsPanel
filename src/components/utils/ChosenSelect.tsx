import React, { useState, useEffect } from "react";
import apiClient from "../../hooks/api/apiClient";
import { Sparkles, X, ChevronDown } from "lucide-react";

export interface DesignOption {
  id: number;
  name: string;
}

interface Props {
  setSelectedTech: React.Dispatch<React.SetStateAction<string>>;
  designId: any;
  onSelectDesign?: (design: DesignOption | null) => void;
}

const AutoComplete: React.FC<Props> = ({ setSelectedTech, designId, onSelectDesign }) => {
  const [query, setQuery] = useState("");
  const [allData, setAllData] = useState<DesignOption[]>([]); // full API data
  const [filtered, setFiltered] = useState<DesignOption[]>([]);
  const [show, setShow] = useState(false);

  // ✅ Fetch data once
  const getData = async () => {
    try {
      const res = await apiClient.get("/admin/Events/Design/find");
      const mapped: DesignOption[] = (res.data?.results || []).map((rows: any) => ({
        id: rows.id,
        name: rows.design_name,
      }));

      setAllData(mapped);
    } catch (err) {
      console.error("Error fetching designs:", err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Sync with designId changes from parent
  useEffect(() => {
    if (designId && allData.length > 0) {
      const selectedDesign = allData.find(
        (item) => item.id === Number(designId)
      );

      if (selectedDesign) {
        setQuery(selectedDesign.name);
        setSelectedTech(selectedDesign.name);
        setFiltered([selectedDesign]);
        setShow(false);
      }
    } else if (!designId) {
      setQuery("");
      setShow(false);
    }
  }, [designId, allData]);

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedTech(value);

    if (value.trim() === "") {
      setFiltered([]);
      setShow(false);
      if (onSelectDesign) onSelectDesign(null);
      return;
    }

    const result = allData.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(result);
    setShow(true);

    // If typed value exactly matches an existing design
    const exactMatch = allData.find(
      (item) => item.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    if (exactMatch && onSelectDesign) {
      onSelectDesign(exactMatch);
    } else if (!exactMatch && onSelectDesign) {
      // Custom/new design name typed (no previous event yet)
      onSelectDesign({ id: 0, name: value.trim() });
    }
  };

  // ✅ Handle select from dropdown
  const handleSelect = (item: DesignOption) => {
    setQuery(item.name);
    setSelectedTech(item.name);
    setShow(false);
    if (onSelectDesign) {
      onSelectDesign(item);
    }
  };

  // ✅ Clear input
  const handleClear = () => {
    setQuery("");
    setSelectedTech("");
    setShow(false);
    setFiltered([]);
    if (onSelectDesign) {
      onSelectDesign(null);
    }
  };

  return (
    <div className="md:col-span-2 relative mt-2">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400" />
          <span>Select Design (Auto-fills Event Data)</span>
        </label>
        {allData.length > 0 && (
          <span className="text-[11px] text-gray-400">
            {allData.length} saved design(s)
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (allData.length > 0) {
              setFiltered(query ? allData.filter(i => i.name.toLowerCase().includes(query.toLowerCase())) : allData);
              setShow(true);
            }
          }}
          placeholder="Search or type design name (e.g. Wedding Mandap, Corporate Stage 30ft)..."
          className="h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 pr-16 py-2.5 text-sm text-gray-800 dark:text-white shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-gray-600 dark:hover:text-gray-200 transition"
              title="Clear design"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (!show) {
                setFiltered(allData);
                setShow(true);
              } else {
                setShow(false);
              }
            }}
            className="p-1 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {show && (
        <ul className="absolute w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-1.5 z-50 max-h-60 overflow-y-auto shadow-xl divide-y divide-gray-100 dark:divide-gray-700/60 custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <li
                key={item.id}
                className="p-3 text-sm cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-gray-800 dark:text-gray-200 flex items-center justify-between transition"
                onClick={() => handleSelect(item)}
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-[11px] font-mono text-gray-400">#{item.id}</span>
              </li>
            ))
          ) : (
            <li className="p-3 text-xs text-gray-400 text-center">
              No matching design found. Continue typing to create a new one.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default AutoComplete;