import { useEffect, useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";
import Label from "../components/form/Label";
import { Plus } from "lucide-react";

type VerticalRowType = {
  size: string;
  quantity: string;
  unit: string;
};

type HorizontalRowType = {
  size: string;
  quantity: string;
  unit: string;
};

export default function StockModel({ isOpen, closeModal }: any) {
  if (!isOpen) return null;

  // ================= STATES =================

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [wareHouse, setWarehouse] = useState<any[]>([]);

  const [inventory, setInventory] = useState<any>({});

  const [enabled, setEnabled] = useState(false);
  const [enabledprice, setEnabledprice] = useState(false);

  const [verticalEnabled, setVerticalEnabled] = useState(false);
  const [horizontalEnabled, setHorizontalEnabled] = useState(false);

  // ================= VERTICAL ROWS =================

  const [verticalRows, setVerticalRows] = useState<VerticalRowType[]>([
    {
      size: "",
      quantity: "",
      unit: "ft",
    },
  ]);

  // ================= HORIZONTAL ROWS =================

  const [horizontalRows, setHorizontalRows] = useState<
    HorizontalRowType[]
  >([
    {
      size: "",
      quantity: "",
      unit: "ft",
    },
  ]);

  // ================= HANDLERS =================

  const datahandler = (e: any) => {
    setInventory((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const eventHandler = async (e: any) => {
    try {
      const id = e.target.value;

      const results = await apiClient.get(
        `/admin/subCategory/findByid/${id}`
      );

      setSubCategories(results?.data?.results || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= GET DATA =================

  const getCategories = async () => {
    try {
      const results = await apiClient.get("/admin/category/find");
      setCategories(results?.data?.results || []);
    } catch (err) {
      console.log(err);
    }
  };

  const wareHouses = async () => {
    try {
      const results = await apiClient.get("/admin/warehouse/find");
      setWarehouse(results?.data?.results || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getCategories();
    wareHouses();
  }, []);

  // ================= ENABLE =================

  useEffect(() => {
    setInventory((prev: any) => ({
      ...prev,
      status: enabled ? 1 : 0,
    }));
  }, [enabled]);

  // ================= VERTICAL =================

  const addVerticalRow = () => {
    setVerticalRows((prev) => [
      ...prev,
      {
        size: "",
        quantity: "",
        unit: "ft",
      },
    ]);
  };

  const handleVerticalChange = (
    index: number,
    field: keyof VerticalRowType,
    value: string
  ) => {
    const updated = [...verticalRows];
    updated[index][field] = value;
    setVerticalRows(updated);
  };

  // ================= HORIZONTAL =================

  const addHorizontalRow = () => {
    setHorizontalRows((prev) => [
      ...prev,
      {
        size: "",
        quantity: "",
        unit: "ft",
      },
    ]);
  };

  const handleHorizontalChange = (
    index: number,
    field: keyof HorizontalRowType,
    value: string
  ) => {
    const updated = [...horizontalRows];
    updated[index][field] = value;
    setHorizontalRows(updated);
  };

  // ================= SUBMIT =================

  const submitHandler = async (e: any) => {
    e.preventDefault();

    const verticalData = verticalRows.filter(
      (r) => r.size || r.quantity
    );

    const horizontalData = horizontalRows.filter(
      (r) => r.size || r.quantity
    );

    const payload = {
      ...inventory,
      have_size: enabled ? 1 : 0,

      vertical_enabled: verticalEnabled ? 1 : 0,
      horizontal_enabled: horizontalEnabled ? 1 : 0,

      vertical_data: verticalData,
      horizontal_data: horizontalData,
    };

    console.log(payload);

    try {
      const results = await apiClient.post(
        "/admin/Inverntory/create",
        payload
      );

      console.log(results);

      closeModal();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="relative mx-auto my-10 w-[95%] max-w-7xl rounded-2xl overflow-hidden bg-white dark:bg-gray-900"
    >
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">
          Inventory Stock
        </h2>
      </div>

      {/* BODY */}
      <div className="p-5 overflow-y-auto max-h-[90vh]">
        <form onSubmit={submitHandler} className="space-y-6">
          {/* WAREHOUSE */}
          <div>
            <Label>Warehouse</Label>

            <select
              name="ware_house_id"
              onChange={datahandler}
              className="h-11 w-full rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
            >
              <option value={0}>Select Warehouse</option>

              {wareHouse.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>

              <select
                name="categories_id"
                onChange={(e) => {
                  eventHandler(e);
                  datahandler(e);
                }}
                className="h-11 w-full rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
              >
                <option value={0}>Select Category</option>

                {categories.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Sub Category</Label>

              <select
                name="sub_categories_id"
                onChange={datahandler}
                className="h-11 w-full rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
              >
                <option value={0}>Select Sub Category</option>

                {subCategories.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SIZE ENABLE */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <span className="font-medium">
              Have Width & Height ?
            </span>

            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                enabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>

            {!enabled && (
              <input
                name="quantity"
                placeholder="Quantity"
                onChange={datahandler}
                className="h-11 rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
              />
            )}
          </div>

          {/* VERTICAL + HORIZONTAL */}
          {enabled && (
            <div className="space-y-6">
              {/* TOGGLE */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={verticalEnabled}
                    onChange={() =>
                      setVerticalEnabled(!verticalEnabled)
                    }
                  />
                  Vertical
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={horizontalEnabled}
                    onChange={() =>
                      setHorizontalEnabled(!horizontalEnabled)
                    }
                  />
                  Horizontal
                </label>
              </div>

              {/* VERTICAL */}
              {verticalEnabled && (
                <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Vertical Sizes
                    </h3>

                    <button
                      type="button"
                      onClick={addVerticalRow}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>

                  <div className="space-y-4">
                    {verticalRows.map((row, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {/* SIZE + UNIT */}
                        <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                          <input
                            type="text"
                            placeholder="Size"
                            value={row.size}
                            onChange={(e) =>
                              handleVerticalChange(
                                index,
                                "size",
                                e.target.value
                              )
                            }
                            className="flex-1 h-11 px-3 outline-none bg-transparent dark:bg-gray-900"
                          />

                          <select
                            value={row.unit}
                            onChange={(e) =>
                              handleVerticalChange(
                                index,
                                "unit",
                                e.target.value
                              )
                            }
                            className="h-11 border-l border-gray-300 bg-gray-50 px-3 outline-none dark:bg-gray-800 dark:border-gray-700"
                          >
                            <option value="ft">FT</option>
                            <option value="m">M</option>
                            <option value="mm">MM</option>
                            <option value="in">IN</option>
                          </select>
                        </div>

                        {/* QTY */}
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={row.quantity}
                          onChange={(e) =>
                            handleVerticalChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="h-11 rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HORIZONTAL */}
              {horizontalEnabled && (
                <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Horizontal Sizes
                    </h3>

                    <button
                      type="button"
                      onClick={addHorizontalRow}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>

                  <div className="space-y-4">
                    {horizontalRows.map((row, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {/* SIZE + UNIT */}
                        <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                          <input
                            type="text"
                            placeholder="Size"
                            value={row.size}
                            onChange={(e) =>
                              handleHorizontalChange(
                                index,
                                "size",
                                e.target.value
                              )
                            }
                            className="flex-1 h-11 px-3 outline-none bg-transparent dark:bg-gray-900"
                          />

                          <select
                            value={row.unit}
                            onChange={(e) =>
                              handleHorizontalChange(
                                index,
                                "unit",
                                e.target.value
                              )
                            }
                            className="h-11 border-l border-gray-300 bg-gray-50 px-3 outline-none dark:bg-gray-800 dark:border-gray-700"
                          >
                            <option value="ft">FT</option>
                            <option value="m">M</option>
                            <option value="mm">MM</option>
                            <option value="in">IN</option>
                          </select>
                        </div>

                        {/* QTY */}
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={row.quantity}
                          onChange={(e) =>
                            handleHorizontalChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="h-11 rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GOOD BAD MISSING */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Good Wares</Label>

              <input
                name="good"
                placeholder="Good Quantity"
                onChange={datahandler}
                className="h-11 w-full rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>

            <div>
              <Label>Bad Wares</Label>

              <input
                name="bad"
                placeholder="Bad Quantity"
                onChange={datahandler}
                className="h-11 w-full rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>

            <div>
              <Label>Missing Wares</Label>

              <input
                name="missing"
                placeholder="Missing Quantity"
                onChange={datahandler}
                className="h-11 w-full rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
          </div>

          {/* PRICE */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <span className="font-medium">Price (₹)</span>

            <button
              type="button"
              onClick={() => setEnabledprice(!enabledprice)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                enabledprice ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  enabledprice ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>

            {enabledprice && (
              <input
                name="price"
                placeholder="Enter Price"
                onChange={datahandler}
                className="h-11 rounded-xl border border-gray-300 px-3 dark:bg-gray-900 dark:border-gray-700"
              />
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="h-11 px-6 rounded-xl border border-gray-300"
            >
              Close
            </button>

            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-green-600 text-white"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}