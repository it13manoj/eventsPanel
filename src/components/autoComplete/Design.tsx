import React, { useState } from "react";

interface Option {
  id: number;
  name: string;
}

const options: Option[] = [
  { id: 1, name: "Java" },
  { id: 2, name: "Spring Boot" },
  { id: 3, name: "React" },
  { id: 4, name: "Node.js" },
  { id: 5, name: "Microservices" },
];

const Design = () => {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Option[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 0) {
      const result = options.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(result);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelect = (name: string) => {
    setQuery(name);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      />

      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700">
          {filtered.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelect(item.name)}
              className="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Design;