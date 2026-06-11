

export default function AvailableStock() {
  // const [categories, setCategories] = useState([]);
  // const [subCategories, setSubCategories] = useState([]);
  // const [stockList, setStockList] = useState([]);

  // const [filters, setFilters] = useState({
  //   category_id: "",
  //   sub_category_id: "",
  //   event_date: "",
  // });

  // // Load Categories
  // useEffect(() => {
  //   fetchCategories();
  // }, []);

  // const fetchCategories = async () => {
  //   try {
  //     const res = await apiClient.get("/categories");
  //     setCategories(res.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // // Load Sub Categories
  // const fetchSubCategories = async (categoryId) => {
  //   try {
  //     const res = await apiClient.get(
  //       `/sub-categories/${categoryId}`
  //     );
  //     setSubCategories(res.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // // Search Available Stock
  // const searchStock = async () => {
  //   try {
  //     const res = await apiClient.get("/available-stock", {
  //       params: filters,
  //     });

  //     setStockList(res.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return (
    <div className="p-6">

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Available Stock
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          {/* Category */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Category
            </label>

            <select
              value=""
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select Category</option>

              
                <option>
                  
                </option>
            </select>
          </div>

          {/* Sub Category */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Sub Category
            </label>

            <select
              value=""
              className="w-full border rounded-lg p-3"
            >
              <option value="">
                Select Sub Category
              </option>

             
                <option>
                  
                </option>
            </select>
          </div>

          {/* Event Date */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Event Date
            </label>

            <input
              type="date"
              value=""
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              Search
            </button>
          </div>

        </div>
      </div>

      {/* Result Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-gray-100">              
              <tr>
                <th className="p-3 text-left">
                  Sr.no.
                </th>
                <th className="p-3 text-left">
                  Warehouse Name
                </th>
                <th className="p-3 text-left">
                  Category
                </th>
                <th className="p-3 text-left">
                  Sub-Category
                </th>
                <th className="p-3 text-center">
                  Total Qty
                </th>
                <th className="p-3 text-center">
                  Booked Qty
                </th>
                <th className="p-3 text-center">
                  Available Qty
                </th>
              </tr>
            </thead>

            <tbody>
                  <tr
                    key={1}
                    className="border-t"
                  >
                    <td className="p-3">
                      {}
                    </td>

                    <td className="p-3 text-center">
                      {}
                    </td>

                    <td className="p-3 text-center">
                      {}
                    </td>

                    <td className="p-3 text-center">
                      {}
                    </td>

                    <td className="p-3 text-center">
                      {}
                    </td>

                    <td className="p-3 text-center">
                      {}
                    </td>

                    <td className="p-3 text-center font-semibold text-green-600">
                      {}
                    </td>
                  </tr>
                <tr>
                  <td
                    
                    className="text-center p-5 text-gray-500"
                  >
                    No Data Found
                  </td>
                </tr>
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}