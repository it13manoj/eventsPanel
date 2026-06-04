import { useState } from "react";
import {
    Printer,
    XCircle,
    Eye,
    FileText,
    X,
} from "lucide-react";

export default function InvoiceListPage() {
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const [invoices, setInvoices] = useState([
        {
            id: "INV-1001",
            customer: "Rahul Kumar",
            date: "26-05-2026",
            amount: 2500,
            status: "Paid",
            mobile: "9876543210",
            address: "Buxar, Bihar",
            items: [
                { name: "Product A", qty: 2, price: 500 },
                { name: "Product B", qty: 3, price: 500 },
            ],
        },
        {
            id: "INV-1002",
            customer: "Amit Singh",
            date: "25-05-2026",
            amount: 4200,
            status: "Pending",
            mobile: "9876501234",
            address: "Patna, Bihar",
            items: [
                { name: "Product X", qty: 1, price: 2200 },
                { name: "Product Y", qty: 2, price: 1000 },
            ],
        },
    ]);

    const handleCancel = (invoiceId: string) => {
        const confirmCancel = window.confirm(
            "Are you sure want to cancel invoice?"
        );

        if (confirmCancel) {
            setInvoices((prev) =>
                prev.map((invoice) =>
                    invoice.id === invoiceId
                        ? { ...invoice, status: "Cancelled" }
                        : invoice
                )
            );
        }
    };

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
                            <th className="p-3 text-left">Amount</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {invoices.map((invoice, index) => (
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div
                        id="invoice-print"
                        className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative"
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
                                        Product
                                    </th>

                                    <th className="border p-2 text-center">
                                        Qty
                                    </th>

                                    <th className="border p-2 text-center">
                                        Price
                                    </th>

                                    <th className="border p-2 text-center">
                                        Total
                                    </th>
                                    <th className="border p-2 text-center">
                                        Payment Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {selectedInvoice.items.map(
                                    (item: any, i: number) => (
                                        <tr key={i}>
                                            <td className="border p-2">
                                                {item.name}
                                            </td>

                                            <td className="border p-2 text-center">
                                                {item.qty}
                                            </td>

                                            <td className="border p-2 text-center">
                                                ₹ {item.price}
                                            </td>

                                            <td className="border p-2 text-center">
                                                ₹ {item.qty * item.price}
                                            </td>
                                            {/* Payment Status Column */}
                                            <td className="border p-2 text-center">

                                                <div className="flex flex-col items-center gap-2">

                                                    {/* Checkbox */}
                                                    <input
                                                        type="checkbox"
                                                        checked={item.paid || false}
                                                        onChange={(e) => {
                                                            const updatedItems = [...selectedInvoice.items];

                                                            updatedItems[i] = {
                                                                ...updatedItems[i],
                                                                paid: e.target.checked,
                                                            };

                                                            // Calculate Remaining Amount
                                                            const remainingAmount = updatedItems.reduce(
                                                                (total: number, product: any) => {
                                                                    if (!product.paid) {
                                                                        return total + (product.qty * product.price);
                                                                    }
                                                                    return total;
                                                                },
                                                                0
                                                            );

                                                            setSelectedInvoice({
                                                                ...selectedInvoice,
                                                                items: updatedItems,
                                                                amount: remainingAmount,
                                                            });
                                                        }}
                                                        className="w-4 h-4 cursor-pointer"
                                                    />

                                                    {/* Status */}
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${item.paid
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {item.paid ? "Paid" : "Unpaid"}
                                                    </span>

                                                </div>

                                            </td>
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
                                onClick={() => window.print()}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                                <Printer size={18} />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}