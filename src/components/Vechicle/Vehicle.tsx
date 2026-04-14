import { useEffect } from "react";
import PageMeta from "../common/PageMeta";
import PageBreadcrumb from "../common/PageBreadCrumb";
import { Table, TableCell, TableHeader, TableRow } from "../ui/table";

export default function Vechicle() {


  // ✅ Resize Logic
  useEffect(() => {
    const resizers = document.querySelectorAll<HTMLSpanElement>(".resizer");

    resizers.forEach((resizer) => {
      let startX = 0;
      let startWidth = 0;

      const mouseDownHandler = (e: MouseEvent) => {
        const th = resizer.parentElement as HTMLElement;

        startX = e.clientX;
        startWidth = th.offsetWidth;

        const mouseMoveHandler = (e: MouseEvent) => {
          const dx = e.clientX - startX;
          th.style.width = `${startWidth + dx}px`;
        };

        const mouseUpHandler = () => {
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);
        };

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      };

      resizer.addEventListener("mousedown", mouseDownHandler);

      return () => {
        resizer.removeEventListener("mousedown", mouseDownHandler);
      };
    });
  }, []);

  return (
    <div>
      <PageMeta
        title="Vehicle Dashboard"
        description="Vehicle Management"
      />
      <PageBreadcrumb pageTitle="Vehicle" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12 overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>

              {[
                "#",
                "Vehicle Number",
                "Vehicle Type",
                "Owner / Agent Name",
                "Contact Number",
                "Ownership Type",
                "Load Capacity",
                "Commission (%)",
                "Insurance Expiry",
                "Status"
              ].map((col, i) => (
                <TableCell
                  key={i}
                  isHeader
                  className="relative px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 resize-column"
                >
                  {col}

                  {/* ✅ Resizer Handle */}
                  <span className="resizer"></span>
                </TableCell>
              ))}

            </TableRow>
          </TableHeader>
        </Table>
      </div>
    </div>
  );
}