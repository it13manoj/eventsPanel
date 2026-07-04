import { useEffect, useState } from "react";
import {
    Printer,
    XCircle,
    Eye,
    FileText,
    X,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import apiClient from "../../hooks/api/apiClient";
import { FaFileInvoiceDollar } from "react-icons/fa";

interface Item {
    bookedEventId: number;
    categoryId: number;
    categoryName: string;
    subCategoryId: number;
    subCategoryName: string;
    qty: number;
    vprice: string;
    hprice: string;
    sprice: string;
    vertical: number;
    horizontal: number;
    verticalPcs: number;
    horizontalPcs: number;
    verticalUnit: string | null;
    horizontalUnit: string | null;
}

interface Data {
    id: string;
    customer: string;
    date: string;
    eventDate: string;
    mobile: string;
    address: string;
    amount: number;
    status: string;
    items: Item[];
}

interface PaymentHistory {
    id: number;
    event_id: number;
    price: string;
    remaining: string;
    paid_date: string;
    created_at: string;
    updated_at: string;
}
export default function InvoiceListPage() {
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [bill, setBill] = useState<number | string>("");
    const [remaining, setRemaing] = useState<number | "">("");
    const [billAmount, setBillAmount] = useState<number | "">("");
    const [invoices, setInvoices] = useState<Data[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const getInvoice = async () => {

        try {

            const results = await apiClient.get(`/admin/Events/bookedEvents/invoices`)

            setInvoices(results.data.results);

        } catch {

        }
    }

    useEffect(() => {
        getInvoice()
    }, [0])

    const handleCancel = (invoiceId: string) => {
        const confirmCancel = window.confirm(
            "Are you sure want to cancel invoice?"
        );

        if (confirmCancel) {
            setInvoices((prev) =>
                prev.map((invoice) =>
                    invoice?.id === invoiceId
                        ? { ...invoice, status: "Cancelled" }
                        : invoice
                )
            );
        }
    };


    //  ---------------------------PDF GENERATOR ------

    const downloadPDF = () => {
        if (!selectedInvoice) return;

        // Initialize A4 PDF
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.setFont("helvetica", "normal");

        // =====================
        // BRANDING & HEADER
        // =====================
        // Top primary color accent bar
        pdf.setFillColor(30, 41, 59); // Slate 800
        pdf.rect(0, 0, 210, 8, "F");

        pdf.setFontSize(22);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 41, 59);
        pdf.text("INVOICE", 14, 25);

        // Metadata Right-Aligned
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Invoice No: # ${selectedInvoice.id}`, 196, 25, { align: "right" });
        pdf.text(
            `Date: ${new Date(selectedInvoice.date).toLocaleDateString("en-IN")}`,
            196, 31, { align: "right" }
        );

        // Thin decorative line
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.line(14, 37, 196, 37);

        // =====================
        // BILLING DETAILS
        // =====================
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(71, 85, 105);
        pdf.text("BILLED TO:", 14, 46);

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(selectedInvoice.customer, 14, 53);

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        pdf.text(`Address: ${selectedInvoice.address}`, 14, 60);
        pdf.text(`Mobile:  +91 ${selectedInvoice.mobile}`, 14, 66);

        // =====================
        // DATA COMPUTATION
        // =====================
        let grandTotal = 0;

        const tableRows = selectedInvoice.items.map((item: any, index: number) => {
            // Base base price selection logic
            let baseAmount = item.vprice && Number(item.vprice) > 0
                ? Number(item.vprice)
                : item.hprice && Number(item.hprice) > 0
                    ? Number(item.hprice)
                    : Number(item.sprice || 0);

            // Fixed Math: Using the actual dynamic value cleanly
            const amount = baseAmount;

            // Dynamic quantity selection logic
            const quantity = item?.verticalUnit
                ? Number(item?.verticalPcs || 0)
                : item?.horizontalUnit
                    ? Number(item.horizontalPcs || 0)
                    : Number(item.qty || 0);

            // Multiply by quantity to get correct total per line item
            const lineTotal = amount;
            grandTotal += lineTotal;

            const formattedAmount = amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

            const formattedLineTotal = lineTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

            // Replaced "₹" with "INR" to fix the rendering glitch ('¹' appearing)
            return [
                index + 1,
                item.categoryName || "-",
                item.subCategoryName || "-",
                quantity,
                `INR ${formattedAmount}`,
                `INR ${formattedLineTotal}`,
            ];
        });

        // =====================
        // DATA TABLE (Adjusted Widths)
        // =====================
        autoTable(pdf, {
            startY: 75,
            theme: "striped",
            margin: { left: 14, right: 14 }, // Strict bounds checking
            styles: {
                font: "helvetica",
                fontSize: 9,
                cellPadding: 4,
                textColor: [51, 65, 85],
            },
            headStyles: {
                fillColor: [241, 245, 249],
                textColor: [15, 23, 42],
                fontStyle: "bold",
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            head: [[
                "Sl. No.",
                "Category",
                "Sub-Category",
                "Qty",
                "Unpaid Rate",
                "Total",
            ]],
            body: tableRows,
            columnStyles: {
                0: { halign: "center", cellWidth: 15 },
                1: { cellWidth: 35 },
                2: { cellWidth: 40 },
                3: { halign: "center", cellWidth: 15 },
                4: { halign: "right", cellWidth: 38 },
                5: { halign: "right", cellWidth: 39 },
            },
        });

        // =====================
        // SUMMARY CARD
        // =====================
        const finalY = (pdf as any).lastAutoTable.finalY + 15;

        const formattedTotal = grandTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(`Grand Total: INR ${formattedTotal}`, 196, finalY, { align: "right" });

        // Status Indicator Badge
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        // pdf.text(`Payment Status: ${selectedInvoice.status.toUpperCase()}`, 196, finalY + 7, { align: "right" });

        // =====================
        // FOOTER (Sticky-Bottom Style)
        // =====================
        const pageHeight = pdf.internal.pageSize.height;

        // Bottom separating accent line
        pdf.setDrawColor(241, 245, 249);
        pdf.line(14, pageHeight - 25, 196, pageHeight - 25);

        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.setFont("helvetica", "italic");
        pdf.text("Thank you for choosing us for your business!", 14, pageHeight - 18);

        pdf.setFont("helvetica", "normal");
        pdf.text("Generated by ABC Event Management", 196, pageHeight - 18, { align: "right" });

        // Save output PDF file
        pdf.save(`Invoice_${selectedInvoice.id}.pdf`);
    };



    const PayBill = async () => {
        const totalPaid =
            paymentHistory?.reduce(
                (sum, item) => sum + Number(item.price),
                0
            ) || 0;

        // Remaining amount
        const unpaidAmount = Number(billAmount) - totalPaid;
        try {
            const params = {
                event_id: bill.toString().replace("INV-", ""),
                price: Number(remaining),
                remaining: unpaidAmount-Number(remaining),
                paid_date: new Date()
            }

            await apiClient.post(`/admin/epay`, params)
            getPaidBill();
            setRemaing("");
        } catch {

        }

    }

    const getPaidBill = async () => {
        try {
            const event_id = bill.toString().replace("INV-", "")

            const results = await apiClient.get(`/admin/epay/event/${event_id}`,)
            console.log(results);
            setPaymentHistory(results.data.results || []);
        } catch {

        }
    }

    useEffect(() => {
        getPaidBill();
    }, [bill])



    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <FileText className="text-blue-600" />
                <h1 className="text-2xl font-bold">
                    Invoice List
                </h1>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="p-3 text-left">Invoice No</th>
                            <th className="p-3 text-left">Customer</th>
                            <th className="p-3 text-left">Booking Date</th>
                            <th className="p-3 text-left">Total</th>
                            <th className="p-3 text-left">Unpaid</th>
                            <th className="p-3 text-left">Pay</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {invoices && invoices?.map((invoice, index) => (
                            <tr
                                key={invoice.id}
                                className={`border-b ${index % 2 === 0
                                    ? "bg-gray-50"
                                    : "bg-white"
                                    }`}
                            >
                                <td className="p-3">{invoice.id}</td>
                                <td className="p-3">{invoice.customer}</td>
                                <td className="p-3">{invoice.date}</td>
                                <td className="p-3">
                                    ₹ {invoice.amount}
                                </td>
                                <td className="p-3">
                                    ₹ {invoice.amount}
                                </td>
                                <td>

                                    <button className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm" onClick={() => setBill(invoice.id)}>
                                        <FaFileInvoiceDollar />
                                        Bill Pay
                                    </button>
                                </td>
                                <td className="p-3">
                                    <div className="flex justify-center gap-2">


                                        {/* View Button */}
                                        <button
                                            onClick={() => setSelectedInvoice(invoice)}
                                            className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm"
                                        >
                                            <Eye size={16} />
                                            View
                                        </button>

                                        {/* Cancel Button */}
                                        {invoice.status !== "Cancelled" && (
                                            <button
                                                onClick={() => handleCancel(invoice.id)}
                                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                                            >
                                                <XCircle size={16} />
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Popup Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center" >

                    <div
                        id="invoice-print"
                        className="bg-white w-full max-w-6xl rounded-xl shadow-lg p-6 relative"
                    >

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                        >
                            <X size={22} />
                        </button>

                        {/* Invoice Header */}
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-bold text-blue-600">
                                Invoice Details
                            </h2>
                        </div>

                        {/* Invoice Info */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <p>
                                    <strong>Invoice No:</strong>{" "}
                                    {selectedInvoice.id}
                                </p>

                                <p>
                                    <strong>Customer:</strong>{" "}
                                    {selectedInvoice.customer}
                                </p>

                                <p>
                                    <strong>Address:</strong>{" "}
                                    {selectedInvoice.address}
                                </p>
                            </div>

                            <div>
                                <p>
                                    <strong>Date:</strong>{" "}
                                    {selectedInvoice.date}
                                </p>

                                <p>
                                    <strong>Mobile:</strong>{" "}
                                    {selectedInvoice.mobile}
                                </p>
                            </div>
                        </div>

                        {/* Product Table */}
                        <table className="w-full border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2 text-left">
                                        Sl.No
                                    </th>
                                    <th className="border p-2 text-left">
                                        Categories
                                    </th>
                                    <th className="border p-2 text-left">
                                        Sub-Categories
                                    </th>
                                    <th className="border p-2 text-center">
                                        Qty
                                    </th>

                                    <th className=" hidden border p-2 text-center">
                                        Unpaid
                                    </th>

                                    <th className="border p-2 text-center">
                                        Total
                                    </th>

                                </tr>
                            </thead>

                            <tbody>
                                {selectedInvoice.items.map(
                                    (item: any, i: number) => (
                                        <tr key={i}>
                                            <td className="border p-2">
                                                {i + 1}
                                            </td>
                                            <td className="border p-2">
                                                {item.categoryName}
                                            </td>

                                            <td className="border p-2 text-center">
                                                {item.subCategoryName}
                                            </td>
                                            <td className="border p-2 text-center">
                                                {item?.verticalUnit ? item?.verticalPcs : item?.horizontalUnit ? item.horizontalPcs : item.qty}
                                            </td>

                                            <td className=" hidden border p-2 text-center">
                                                ₹ {Number(item.vprice) > 0 ? item.vprice : Number(item.hprice) > 0 ? item.hprice : item.sprice}
                                            </td>

                                            <td className="border p-2 text-center">
                                                ₹ {Number(item.vprice) > 0 ? item.vprice : Number(item.hprice) > 0 ? item.hprice : item.sprice}
                                            </td>
                                            {/* Payment Status Column */}

                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>

                        {/* Total */}
                        <div className="mt-5 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                Total Amount:
                            </h3>

                            <h3 className="text-2xl font-bold text-green-600">
                                ₹ {selectedInvoice.amount}
                            </h3>
                        </div>
                        <div className="flex justify-center gap-2">
                            {/* Print Button */}
                            <button
                                onClick={downloadPDF}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                                <Printer size={18} />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {bill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center" >

                    <div
                        id="invoice-print"
                        className="bg-white w-full max-w-6xl rounded-xl shadow-lg p-6 relative"
                    >

                        {/* Close Button */}
                        <button
                            onClick={() => setBill("")}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                        >
                            <X size={22} />
                        </button>

                        {/* Invoice Header */}
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-bold text-blue-600">
                                Pay Bill
                            </h2>
                        </div>

                        {/* Invoice Info */}

                        {/* Product Table */}
                        <table className="w-full border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2 text-left">
                                        Invoice No
                                    </th>
                                    <th className="border p-2 text-left">
                                        Customer
                                    </th>
                                    <th className="border p-2 text-left">
                                        VENUE
                                    </th>
                                    <th className="border p-2 text-center">
                                        Location Of VENUE
                                    </th>
                                    <th className="border p-2 text-center">
                                        Total
                                    </th>
                                    <th className="border p-2 text-center">
                                        Unpaid
                                    </th>
                                    <th className="border p-2 text-center">
                                        Pay
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices
                                    ?.filter((row) => row.id === bill)
                                    .map((row) => {
                                        // Total paid for this invoice
                                        const totalPaid =
                                            paymentHistory?.reduce(
                                                (sum, item) => sum + Number(item.price),
                                                0
                                            ) || 0;

                                        // Remaining amount
                                        const unpaidAmount = Number(row.amount) - totalPaid;

                                        return (
                                            <tr key={row.id}>
                                                <td className="p-3">{row.id}</td>
                                                <td className="p-3">{row.customer}</td>
                                                <td className="p-3"></td>
                                                <td className="p-3"></td>

                                                {/* Total Bill */}
                                                <td className="p-3">
                                                    ₹ {Number(row.amount).toFixed(2)}
                                                </td>

                                                {/* Remaining Bill */}
                                                <td className="p-3">
                                                    ₹ {unpaidAmount.toFixed(2)}
                                                </td>

                                                {/* Payment */}
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm"
                                                            value={remaining}
                                                            name="remaining"
                                                            onChange={(e) => {
                                                                setRemaing(Number(e.target.value));
                                                                setBillAmount(Number(row.amount));
                                                            }}
                                                            max={unpaidAmount}
                                                            disabled={unpaidAmount <= 0}
                                                        />

                                                        <button
                                                            className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                                                            onClick={PayBill}
                                                            disabled={unpaidAmount <= 0}
                                                        >
                                                            <FaFileInvoiceDollar />
                                                            Pay
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>

                        </table>
                        <table className="w-full border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2 text-left">
                                        Date
                                    </th>
                                    <th className="border p-2 text-left">
                                        Paid
                                    </th>
                                    <th className="border p-2 text-left">
                                        Remaining
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory?.map((item) => (
                                    <tr key={item.id}>
                                        <td>{new Date(item.paid_date).toLocaleDateString()}</td>
                                        <td>₹ {Number(item.price).toLocaleString("en-IN")}</td>
                                        <td>₹ {Number(item.remaining).toLocaleString("en-IN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Total */}

                    </div>
                </div>
            )}
        </div>
    );
}