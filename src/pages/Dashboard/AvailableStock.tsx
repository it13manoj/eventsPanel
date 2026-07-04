import { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiClient from "../../hooks/api/apiClient";
import { TableBody, TableCell, TableRow } from "../../components/ui/table";



interface SearchBy {
  categories: string;
  subCategories: string;
}

type SizeType = {
  id: number;
  size: string;
  quantity: number;
  unit: string;
};

type InventoryType = {
  id: number;

  categories: {
    name: string;
  };

  subCategories: {
    name: string;
  };

  wareHouse: {
    id: number;
    name: string;
    address: string
  };

  width: string;
  height: string;
  color: string;
  quantity: number;
  quality: string;
  price: number;

  good: number;
  bad: number;
  missing: number;

  have_size: boolean;

  vertical_enabled: boolean;
  horizontal_enabled: boolean;

  verticalSizes: SizeType[];
  horizontalSizes: SizeType[];

  synced?: boolean;
};


// type ItemState = {
//   categoryId: number;
//   subCategoryId: number;
//   isEnable: boolean;

//   dateOfEvent?: string;
//   bookedDate?: string;

//   width?: string;
//   height?: string;

//   value?: string;

//   vertical?: boolean;
//   horizontal?: boolean;

//   verticalValue?: string;
//   horizontalValue?: string;

//   verticalUnit?: string;
//   horizontalUnit?: string;

//   verticalPcs?: string;
//   horizontalPcs?: string;

//   eventsName?: string;
//   eventsId?: number;
//   stockName?: string;
//   stockId?: number
// };





// interface StockAddToEventsType {
//   stock: any[];
//   events: any[];
// }

interface CountData {
  vertical: number;
  horizontal: number;
  quantities: number;
}

export default function AvailableStock() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [searchBy, setSearchBy] = useState<SearchBy>({
    categories: "",
    subCategories: ""
  });
  const [categories, setCategories] = useState([{
    id: "",
    name: ""
  }]);
  const [subCategories, setSubCategories] = useState([{
    id: 0,
    name: "",
    is_enable: false
  }]);
  const [inventory, setInventory] = useState<
    InventoryType[]
  >([]);


  const [counts, setCounts] = useState<Record<number, CountData>>({});

  const [quantities, setQuantities] = useState<any>(
    {}
  );
  // const [getItemsIs_enabled, itemsDate] = useState<ItemState>({
  //   categoryId: 0,
  //   subCategoryId: 0,

  //   isEnable: false,

  //   dateOfEvent: "",
  //   bookedDate: "",

  //   width: "",
  //   height: "",

  //   value: "",

  //   vertical: false,
  //   horizontal: false,

  //   verticalValue: "",
  //   horizontalValue: "",

  //   verticalUnit: "ft",
  //   horizontalUnit: "ft",

  //   verticalPcs: "",
  //   horizontalPcs: "",

  //   eventsName: "",
  //   eventsId: 0,
  //   stockName: "",
  //   stockId: 0
  // });
  const [results_booked, results_bookedSet] = useState<{
    stock: { [key: number]: number };
    event: { [key: number]: number };
  }>({
    stock: {},
    event: {}
  });


  const [remainingS, setRemainingS] = useState<any>({});

  // const [stockAddToEvents, setStockAddToEvents] =
  //   useState<StockAddToEventsType>({
  //     stock: [],
  //     events: [],
  //   });


  console.log(remainingS, setRemainingS);


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



  const SearchHendler = async () => {

    try {

      const results = await apiClient.get(
        `/admin/Inverntory/items/eventStocks/${date}/${searchBy.categories}/${searchBy.subCategories}`
      );

      setInventory(results?.data?.results?.results || []);
      let array: { [key: number]: number } = {};
      let events: { [key: number]: number } = {};

      results?.data?.results?.results_booked?.forEach((rows: any) => {

        const stockIds = JSON.parse(rows.stock_id || "[]");
        const quantities = JSON.parse(rows.st_qt || "[]");

        stockIds.forEach((value: number, key: number) => {

          if (array[value]) {
            array[value] += Number(quantities[key]);
          } else {
            array[value] = Number(quantities[key]);
          }
        });

        const eventsId = JSON.parse(rows.event_stock_id || "[]");
        const eventQT = JSON.parse(rows.evnt_qt || "[]");

        eventsId.forEach((value: number, key: number) => {

          if (events[value]) {
            events[value] += Number(eventQT[key]);
          } else {
            events[value] = Number(eventQT[key]);
          }
        });
      });

      results_bookedSet({
        stock: { ...array },
        event: { ...events }
      });

    } catch (error) {

    }
  };



  const getQunity = async (id: number) => {
    try {
      const res = await apiClient.get(
        `/admin/Inverntory/items/calculate/${id}`
      );

      setQuantities((prev: any) => ({
        ...prev,
        [id]: res.data.results,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    inventory.forEach((row: any) => {
      if (row.have_size) {
        getQunity(row.id);
      }
    });
  }, [inventory]);




  // const handleAdd = (
  //   type: "stock" | "event",
  //   item: any
  // ) => {

  //   // ========================= STOCK =========================
  //   if (type === "stock") {
  //     let newAddedQt = getItemsIs_enabled.horizontalPcs || getItemsIs_enabled.verticalPcs || getItemsIs_enabled.value || 0;
  //     const verticalQty = Number(
  //       item.verticalSizes?.[0]?.quantity || 0
  //     );

  //     const horizontalQty = Number(
  //       item.horizontalSizes?.[0]?.quantity || 0
  //     );

  //     const quantity = Number(
  //       item.quantity || 0
  //     );

  //     // use only existing qty
  //     const usedQty =
  //       verticalQty > 0
  //         ? verticalQty
  //         : horizontalQty > 0 ? horizontalQty : quantity;

  //     // prevent duplicate add


  //     // add stock
  //     setStockAddToEvents((prev: any) => ({
  //       ...prev,

  //       stock: [
  //         ...prev.stock,
  //         {
  //           stockId: item.id,
  //           stockname: item.wareHouse.name,
  //           Categories: item.categories.id,
  //           SubCategoreis: item.subCategories.id,
  //           quntiry: Number(newAddedQt) > usedQty ? usedQty : newAddedQt,
  //         },
  //       ],
  //     }));

  //     // update inventory
  //     setInventory((prev: InventoryType[]) =>
  //       prev.map((row) => {

  //         if (row.id !== item.id) return row;

  //         return {
  //           ...row,

  //           synced: true,

  //           verticalSizes: row.verticalSizes.map(
  //             (size) => ({
  //               ...size,

  //               quantity:
  //                 size.quantity > 0
  //                   ? Math.max(
  //                     0,
  //                     Number(size.quantity) - usedQty
  //                   )
  //                   : 0,
  //             })
  //           ),

  //           horizontalSizes: row.horizontalSizes.map(
  //             (size) => ({
  //               ...size,

  //               quantity:
  //                 size.quantity > 0
  //                   ? Math.max(
  //                     0,
  //                     Number(size.quantity) - usedQty
  //                   )
  //                   : 0,
  //             })
  //           ),

  //           quantity:
  //             Number(row.quantity || 0) > 0
  //               ? Math.max(
  //                 0,
  //                 Number(row.quantity) - usedQty
  //               )
  //               : 0,
  //         };
  //       })
  //     );

  //     // update selected available qty
  //     itemsDate((prev: any) => ({

  //       ...prev,

  //       verticalPcs:
  //         Number(prev.verticalPcs ?? 0) > 0
  //           ? String(
  //             Math.max(
  //               0,
  //               Number(prev.verticalPcs) - usedQty
  //             )
  //           )
  //           : prev.verticalPcs,

  //       horizontalPcs:
  //         Number(prev.horizontalPcs ?? 0) > 0
  //           ? String(
  //             Math.max(
  //               0,
  //               Number(prev.horizontalPcs) - usedQty
  //             )
  //           )
  //           : prev.horizontalPcs,

  //       quantity:
  //         Number(prev.quantity ?? 0) > 0
  //           ? Math.max(
  //             0,
  //             Number(prev.quantity) - usedQty
  //           )
  //           : 0,
  //     }));
  //   }
  // };

  useEffect(() => {
    const fetchBookedItems = async () => {
      if (!inventory?.length) return;

      const newCounts: Record<number, any> = {};

      await Promise.all(
        inventory.map(async (row) => {
          const res = await apiClient.get(
            `/admin/Events/bookedEvents/bookedItemsInStocked/${date}/${searchBy.categories}/${searchBy.subCategories}/${row.id}`
          );

          newCounts[row.id] = res.data.results[0];
        })
      );

      setCounts(newCounts);
    };

    fetchBookedItems();
  }, [inventory, date, searchBy.categories, searchBy.subCategories]);

  console.log(counts?.[5]?.vertical);

 
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
              value={searchBy.categories}
              name="categories"
              className="w-full border rounded-lg p-3"
              onChange={(e) => {
                eventHandler(e)
                setSearchBy({
                  ...searchBy,
                  categories: e.target.value,
                })
              }
              }
            >
              <option value="0">Select Category</option>
              {categories && categories?.map(rows => (
                <option value={rows?.id}> {rows.name}</option>
              ))}

            </select>
          </div>

          {/* Sub Category */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Sub Category
            </label>

            <select
              value={searchBy.subCategories}
              name="subCategories"
              className="w-full border rounded-lg p-3"
              onChange={(e) =>
                setSearchBy({
                  ...searchBy,
                  subCategories: e.target.value,
                })
              }
            >
              <option value="">
                Select Sub Category
              </option>


              {subCategories && subCategories.map(rows => (
                <option value={rows?.id}>{rows.name}</option>
              ))}
            </select>
          </div>

          {/* Event Date */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Event Date
            </label>

            <ReactDatePicker
              selected={date}
              onChange={(date: Date | null) => setDate(date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select Dat"
              popperPlacement="bottom-start"
              popperClassName="z-[9999]"
              className="
                             dark:bg-dark-900
                             h-11
                             w-full
                             rounded-lg
                             border
                             border-gray-300
                             bg-transparent
                             px-4
                             py-2.5
                             text-sm
                             text-gray-800
                             shadow-theme-xs
                             placeholder:text-gray-400
                             focus:border-brand-300
                             focus:outline-none
                             focus:ring-2
                             focus:ring-brand-500/10
                             dark:border-gray-700
                             dark:bg-gray-900
                             dark:text-white/90
                           "
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={SearchHendler}
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

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {inventory &&
                inventory.length > 0 ? (
                inventory.map((rows) => (
                  <TableRow key={rows.id}>
                    {/* ====================================================== */}
                    {/* ID */}
                    {/* ====================================================== */}

                    <TableCell className=" px-5 py-4 text-start">
                      {rows.id}
                    </TableCell>

                    {/* ====================================================== */}
                    {/* WAREHOUSE */}
                    {/* ====================================================== */}

                    <TableCell className="px-5 py-4 text-start">
                      {rows?.wareHouse?.name}
                    </TableCell>

                    {/* ====================================================== */}
                    {/* CATEGORY */}
                    {/* ====================================================== */}

                    <TableCell className=" px-5 py-4 text-start">
                      {rows?.categories?.name}
                    </TableCell>

                    {/* ====================================================== */}
                    {/* SUB CATEGORY */}
                    {/* ====================================================== */}

                    <TableCell className=" px-5 py-4 text-start">
                      {rows?.subCategories?.name}
                    </TableCell>

                    {/* ====================================================== */}
                    {/* QUANTITY */}
                    {/* ====================================================== */}

                    <TableCell className="hidden px-5 py-4 text-start">
                      {rows.have_size ? (
                        <span

                          className="cursor-pointer text-blue-500 underline"
                        >
                          {quantities[rows.id] ??
                            "Loading..."}
                        </span>
                      ) : (
                        rows.quantity
                      )}
                    </TableCell>

                    {/* ====================================================== */}
                    {/* GOOD */}
                    {/* ====================================================== */}

                    <TableCell className="hidden px-5 py-4 text-start">
                      {rows.good}
                    </TableCell>

                    {/* ====================================================== */}
                    {/* BAD */}
                    {/* ====================================================== */}

                    <TableCell className="hidden px-5 py-4 text-start">
                      {rows.bad}
                    </TableCell>

                    {/* ====================================================== */}
                    {/* MISSING */}
                    {/* ====================================================== */}

                    <TableCell className="hidden px-5 py-4 text-start">
                      {rows.missing}
                    </TableCell>

                    {/* ====================================================== */}
                    {/* PRICE */}
                    {/* ====================================================== */}

                    <TableCell className="hidden px-5 py-4 text-start">
                      ₹ {rows.price}
                    </TableCell>

                    {/* ====================================================== */}
                    {/* SIZES */}
                    {/* ====================================================== */}

                    <TableCell className="px-5 py-4 text-start">
                      <div className="space-y-3">
                        {/* ================= VERTICAL ================= */}

                        {rows.vertical_enabled &&
                          rows.verticalSizes
                            ?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-blue-600">
                                Vertical
                              </h4>

                              <div className="space-y-1">
                                {rows.verticalSizes.map(
                                  (v) => (
                                    <div
                                      key={v.id}
                                      className="rounded-lg bg-blue-50 px-2 py-1 text-xs dark:bg-blue-900/20"
                                    >
                                      {v.size}
                                      {v.unit}
                                      {" - "}
                                      Qty:
                                      {v.quantity <= (results_booked?.stock?.[rows.id]) ? 0 : v.quantity}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* ================= HORIZONTAL ================= */}

                        {rows.horizontal_enabled &&
                          rows
                            .horizontalSizes
                            ?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-green-600">
                                Horizontal
                              </h4>

                              <div className="space-y-1">
                                {rows.horizontalSizes.map(
                                  (h) => (
                                    <div
                                      key={h.id}
                                      className="rounded-lg bg-green-50 px-2 py-1 text-xs dark:bg-green-900/20"
                                    >
                                      {h.size}
                                      {h.unit}
                                      {" - "}
                                      Qty:
                                      {h.quantity <= (results_booked?.stock?.[rows.id]) ? 0 : h.quantity}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {!rows.vertical_enabled && !rows.horizontal_enabled && rows?.quantity && rows.quantity}
                       

                        {/* ================= SIMPLE QTY ================= */}


                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      {counts[rows.id]?.vertical > 0 ? counts[rows.id]?.vertical : counts[rows.id]?.horizontal > 0 ? counts[rows.id]?.horizontal : counts[rows.id]?.quantities}

                    </TableCell>


                    <TableCell className="  px-5 py-4 sm:px-6 text-start">
                      {rows.vertical_enabled &&
                        rows.verticalSizes
                          ?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-600">
                              Vertical
                            </h4>

                            <div className="space-y-1">
                              {rows.verticalSizes.map(
                                (v) => (
                                  <div
                                    key={v.id}
                                    className="rounded-lg bg-blue-50 px-2 py-1 text-xs dark:bg-blue-900/20"
                                  >
                                    {v.size}
                                    {v.unit}
                                    {" - "}
                                    Qty:
                                    {v.quantity <= (results_booked?.stock?.[rows.id]) ? 0 : v.quantity}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) }

                          {!rows.vertical_enabled && !rows.horizontal_enabled && rows?.quantity &&  rows?.quantity - counts?.[rows?.id]?.quantities}

                      {/* {counts[rows.id].vertical > 0 ? counts[rows.id].vertical : counts[rows.id].horizontal > 0 ?  counts[rows.id].horizontal :  counts[rows.id].quantities } */}

                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="p-5">
                    No Data Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

          </table>
        </div>

      </div>
    </div>
  );
}