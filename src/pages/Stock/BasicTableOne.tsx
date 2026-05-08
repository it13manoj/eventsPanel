import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";


import { useEffect, useState } from "react";
import apiClient from "../../hooks/api/apiClient";
import Items from "../../model/Items";
import { useModal } from "../../hooks/useModal";


export default function BasicTableOne() {
  const [Inverntory, setInventory] = useState([{
    id: "",
    categories: {
      name: ""
    },
    subCategories: {
      name: ""
    },
    WareHouse: {
      id: "",
      name: ""
    },
    width: "",
    height: "",
    color: "",
    quantity: "",
    quality: "",
    price: "",
    is_enable: 0
  }])


  const getInvetory = async () => {
    try {
      const results = await apiClient.get("admin/Inverntory/find")
      setInventory(results?.data?.results);
    } catch {

    }
  }

  useEffect(() => {
    getInvetory()
  }, [0])

  // =============================Resize able table ========================
  useEffect(() => {
    const thElements = document.querySelectorAll(".resizable-table th");

    thElements.forEach((th: any) => {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault(); // stop page scroll

        const delta = e.deltaY;

        const currentWidth = th.offsetWidth;

        // scroll up = increase, scroll down = decrease
        let newWidth = delta < 0
          ? currentWidth + 20
          : currentWidth - 20;

        // min width protection
        newWidth = Math.max(80, newWidth);

        th.style.width = newWidth + "px";
      };

      th.addEventListener("wheel", handleWheel, { passive: false });
    });

    return () => {
      thElements.forEach((th: any) => {
        th.removeEventListener("wheel", () => { });
      });
    };
  }, []);


  const [quantities, setQuantities] = useState<any>({});

  const getQunity = async (id: number) => {
    console.log(id);

    try {
      const res = await apiClient.get(`/admin/Inverntory/items/calculate/${id}`);
      setQuantities((prev: any) => ({
        ...prev,
        [id]: res.data.results
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Inverntory.forEach((row: any) => {
      if (row.is_enable == 1) {
        getQunity(row.id);
      }
    });
  }, [Inverntory]);


  const { isOpen, openModal, closeModal } = useModal();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleOpen = (id: number) => {
    setSelectedId(id);
    openModal()
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table className="resizable-table">
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Ware House
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                SubCategory
              </TableCell>
              <TableCell
                isHeader
                className="px-5 hidden py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Width(ft)
              </TableCell>
              <TableCell
                isHeader
                className="px-5 hidden py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Height(ft)
              </TableCell>
              <TableCell
                isHeader
                className="px-5 hidden py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Color
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Number Of Quantity
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Price(ft)
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Quality
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {Inverntory && Inverntory.map((rows) => (
              <TableRow key={rows?.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      {rows?.id}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {rows?.WareHouse?.name}
                      </span>

                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {rows?.categories?.name}
                      </span>

                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {rows?.subCategories?.name}
                </TableCell>
                <TableCell className="px-4 hidden py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex -space-x-2">
                    {rows?.width}
                  </div>
                </TableCell>
                <TableCell className="px-4 hidden py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {rows?.height}
                </TableCell>
                <TableCell className="px-4 hidden py-3 text-gray-500 text-theme-sm dark:text-gray-400" >
                  <span style={{ background: `${rows?.color}`, display: "block" }}>&nbsp;</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {rows.is_enable == 1 ? (
                    <span
                      onClick={() => handleOpen(parseInt(rows.id))}
                      className="text-blue-500 underline cursor-pointer"
                    >
                      {quantities[rows.id] ?? "Loading..."}
                    </span>
                  ) : (
                    rows?.quantity
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {rows?.price} ₹
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {rows?.quality}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Items  isOpen={isOpen} closeModal ={closeModal} selectedId={selectedId}  />
    </div>
  );
}
