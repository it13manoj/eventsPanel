import { useEffect, useState } from "react";
import {
    Printer,
    XCircle,
    Eye,
    FileText,
    X,
    Truck,
    Layers,
    Calendar,
    MapPin,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    RefreshCw,
    Download,
    Building2,
    Pencil,
    Check
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import apiClient from "../../hooks/api/apiClient";
import images from "../../hooks/api/apiImages";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { toast } from "react-toastify";

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
    rate?: number;
    lineTotal?: number;
    includedInTemplate?: boolean;
}

interface VehicleItem {
    movementId: number;
    vehicleId: number;
    vehicleName: string;
    vehicleNumber: string;
    ownerAgency: string;
    type: string;
    fuelType: string;
    fuelQuantity: number;
    fuelAmount: number;
    commission: number;
    totalCost: number;
    status: string;
}

interface Data {
    id: string;
    eventId: number | string;
    customer: string;
    date: string;
    eventDate: string;
    venue?: string;
    mobile: string;
    address: string;
    partnerName?: string;
    partnerGst?: string;
    partnerPhone?: string;
    partnerAddress?: string;
    invoiceNotes?: string;
    gstRate?: number;
    templateId?: number | null;
    templateName?: string;
    templatePrice?: number;
    hasTemplate?: boolean;
    eventCost?: number;
    transportCost?: number;
    itemsSubtotal: number;
    vehiclesSubtotal: number;
    amount: number; // Grand Total = itemsSubtotal + eventCost + transportCost + vehiclesSubtotal
    paidAmount: number;
    unpaidAmount: number;
    status: string;
    items: Item[];
    vehicles: VehicleItem[];
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

interface CompanyInfo {
    id?: number;
    companyName: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    gstNumber: string;
    logo: string | null;
}

export default function InvoiceListPage() {
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Data | null>(null);
    const [bill, setBill] = useState<number | string>("");
    const [payingInvoice, setPayingInvoice] = useState<Data | null>(null);
    const [remaining, setRemaining] = useState<number | "">("");
    const [invoices, setInvoices] = useState<Data[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [paying, setPaying] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Partner and custom invoice billing details state
    const [partnerModalOpen, setPartnerModalOpen] = useState(false);
    const [editingPartnerInvoice, setEditingPartnerInvoice] = useState<Data | null>(null);
    const [partnerForm, setPartnerForm] = useState({
        partnerName: "",
        partnerGst: "",
        partnerPhone: "",
        partnerAddress: "",
        invoiceNotes: "",
        gstRate: 0 as number | string
    });
    const [savingPartner, setSavingPartner] = useState(false);

    const handleOpenPartnerModal = (inv: Data) => {
        setEditingPartnerInvoice(inv);
        setPartnerForm({
            partnerName: inv.partnerName || inv.customer || "",
            partnerGst: inv.partnerGst || "",
            partnerPhone: inv.partnerPhone || "",
            partnerAddress: inv.partnerAddress || inv.address || "",
            invoiceNotes: inv.invoiceNotes || "",
            gstRate: inv.gstRate !== undefined ? inv.gstRate : 0
        });
        setPartnerModalOpen(true);
    };

    const handleSavePartnerDetails = async (e?: any) => {
        if (e) e.preventDefault();
        if (!editingPartnerInvoice) return;

        setSavingPartner(true);
        try {
            const cleanId = editingPartnerInvoice.eventId
                ? String(editingPartnerInvoice.eventId)
                : editingPartnerInvoice.id.toString().replace("INV-", "");

            const payload = {
                partner_name: partnerForm.partnerName,
                partner_gst: partnerForm.partnerGst,
                partner_phone: partnerForm.partnerPhone,
                partner_address: partnerForm.partnerAddress,
                invoice_notes: partnerForm.invoiceNotes,
                gst_rate: Number(partnerForm.gstRate || 0)
            };

            await apiClient.put(`/admin/Events/invoice-details/${cleanId}`, payload);
            toast.success("Partner & Invoice billing details saved successfully!");

            // Update in local state
            setInvoices(prev => prev.map(inv => {
                if (String(inv.id) === String(editingPartnerInvoice.id) || String(inv.eventId) === String(cleanId)) {
                    return {
                        ...inv,
                        partnerName: partnerForm.partnerName,
                        partnerGst: partnerForm.partnerGst,
                        partnerPhone: partnerForm.partnerPhone,
                        partnerAddress: partnerForm.partnerAddress,
                        invoiceNotes: partnerForm.invoiceNotes,
                        gstRate: Number(partnerForm.gstRate || 0)
                    };
                }
                return inv;
            }));

            if (selectedInvoice && (String(selectedInvoice.id) === String(editingPartnerInvoice.id) || String(selectedInvoice.eventId) === String(cleanId))) {
                setSelectedInvoice(prev => prev ? ({
                    ...prev,
                    partnerName: partnerForm.partnerName,
                    partnerGst: partnerForm.partnerGst,
                    partnerPhone: partnerForm.partnerPhone,
                    partnerAddress: partnerForm.partnerAddress,
                    invoiceNotes: partnerForm.invoiceNotes,
                    gstRate: Number(partnerForm.gstRate || 0)
                }) : null);
            }

            setPartnerModalOpen(false);
        } catch (err: any) {
            console.error("Failed to save partner details:", err);
            toast.error(err.response?.data?.message || "Failed to update partner & GST details");
        } finally {
            setSavingPartner(false);
        }
    };

    const fetchCompany = async () => {
        try {
            const results = await apiClient.get(`/admin/Companies/1`);
            const data = results.data?.data;
            if (data) {
                setCompany({
                    id: data.id || 1,
                    companyName: data.companyName || "Management Pro",
                    email: data.email || "",
                    phone: data.phone || "",
                    website: data.website || "",
                    address: data.address || "",
                    gstNumber: data.gstNumber || "",
                    logo: data.logo || null,
                });
            }
        } catch (err) {
            console.error("Failed to load company profile for invoice:", err);
        }
    };

    const getInvoice = async () => {
        setLoading(true);
        try {
            const results = await apiClient.get(`/admin/Events/bookedEvents/invoices`);
            const list: Data[] = results.data?.results || results.data?.data || [];
            setInvoices(list);
        } catch (err) {
            console.error("Failed to fetch invoices", err);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getInvoice();
        fetchCompany();
    }, []);

    const handleCancel = (invoiceId: string) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this invoice?"
        );

        if (confirmCancel) {
            setInvoices((prev) =>
                prev.map((invoice) =>
                    invoice?.id === invoiceId
                        ? { ...invoice, status: "Cancelled" }
                        : invoice
                )
            );
            toast.info("Invoice marked as cancelled");
        }
    };

    const getPaidBill = async (eventId: string | number) => {
        try {
            const cleanId = eventId.toString().replace("INV-", "");
            const results = await apiClient.get(`/admin/epay/event/${cleanId}`);
            setPaymentHistory(results.data?.results || []);
        } catch (err) {
            console.error("Failed to fetch payment history", err);
        }
    };

    const handleOpenBillPay = (inv: Data) => {
        setBill(inv.id);
        setPayingInvoice(inv);
        setRemaining("");
        getPaidBill(inv.eventId || inv.id);
    };

    const PayBill = async () => {
        if (!payingInvoice) return;
        const totalPaid =
            paymentHistory?.reduce(
                (sum, item) => sum + Number(item.price),
                0
            ) || 0;

        const totalBill = Number(payingInvoice.amount || 0);
        const unpaidAmount = Math.max(0, totalBill - totalPaid);

        const payVal = Number(remaining);
        if (!payVal || payVal <= 0) {
            toast.warning("Please enter a valid payment amount");
            return;
        }

        if (payVal > unpaidAmount) {
            toast.warning(`Payment cannot exceed unpaid balance of ₹${unpaidAmount.toFixed(2)}`);
            return;
        }

        setPaying(true);
        try {
            const cleanEventId = payingInvoice.eventId
                ? String(payingInvoice.eventId)
                : payingInvoice.id.toString().replace("INV-", "");

            const params = {
                event_id: cleanEventId,
                price: payVal,
                remaining: unpaidAmount - payVal,
                paid_date: new Date()
            };

            await apiClient.post(`/admin/epay`, params);
            toast.success("Payment recorded successfully!");
            setRemaining("");
            await getPaidBill(cleanEventId);
            await getInvoice(); // Refresh all invoices with new paid amounts
        } catch (err: any) {
            console.error("Error paying bill:", err);
            toast.error(err?.response?.data?.message || "Failed to process payment");
        } finally {
            setPaying(false);
        }
    };

    const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
        try {
            const res = await fetch(imageUrl);
            if (!res.ok) return null;
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch {
            return null;
        }
    };

    //  --------------------------- PDF GENERATOR ---------------------------
    const downloadPDF = async (invoiceToPrint?: Data) => {
        const inv = invoiceToPrint || selectedInvoice;
        if (!inv) return;

        const pdf = new jsPDF("p", "mm", "a4");
        pdf.setFont("helvetica", "normal");

        // Top primary color accent bar
        pdf.setFillColor(30, 41, 59); // Slate 800
        pdf.rect(0, 0, 210, 6, "F");

        let logoLoaded = false;
        if (company?.logo) {
            try {
                const logoUrl = `${images.baseUrl}/${company.logo}`;
                const base64 = await getBase64ImageFromUrl(logoUrl);
                if (base64) {
                    const format = company.logo.toLowerCase().endsWith(".png") ? "PNG" : "JPEG";
                    pdf.addImage(base64, format, 14, 9, 22, 22);
                    logoLoaded = true;
                }
            } catch (e) {
                console.error("Error drawing logo in PDF:", e);
            }
        }

        const companyStartX = logoLoaded ? 39 : 14;

        // Company Name
        pdf.setFontSize(15);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 41, 59);
        pdf.text(company?.companyName || "Management Pro", companyStartX, 15);

        // Company Address & Contacts
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 116, 139);
        if (company?.address) {
            pdf.text(company.address, companyStartX, 20);
        }
        const contactLine = [
            company?.phone ? `Ph: ${company.phone}` : "",
            company?.email ? `Email: ${company.email}` : ""
        ].filter(Boolean).join("  |  ");
        if (contactLine) {
            pdf.text(contactLine, companyStartX, 25);
        }
        if (company?.gstNumber) {
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(51, 65, 85);
            pdf.text(`GSTIN: ${company.gstNumber}`, companyStartX, 30);
        }

        // Right Header - Invoice Metadata
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 41, 59);
        pdf.text("TAX INVOICE", 196, 15, { align: "right" });

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Invoice No: ${inv.id}`, 196, 21, { align: "right" });
        pdf.text(
            `Date: ${inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}`,
            196, 26, { align: "right" }
        );
        pdf.text(
            `Event Date: ${inv.eventDate ? new Date(inv.eventDate).toLocaleDateString("en-IN") : "NA"}`,
            196, 31, { align: "right" }
        );

        // Decorative separator line
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.line(14, 35, 196, 35);

        // Billing Details
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(71, 85, 105);
        pdf.text("BILLED TO / PARTNER DETAILS:", 14, 43);

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        const billedParty = inv.partnerName
            ? `${inv.partnerName}${inv.customer && inv.customer !== inv.partnerName ? ` (Client: ${inv.customer})` : ""}`
            : (inv.customer || "Valued Customer");
        pdf.text(billedParty, 14, 49);

        let billingY = 54;
        pdf.setFontSize(8.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);

        if (inv.partnerGst) {
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(37, 99, 235);
            pdf.text(`Partner GSTIN: ${inv.partnerGst}`, 14, billingY);
            billingY += 4.5;
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(71, 85, 105);
        }

        const billingAddr = inv.partnerAddress || inv.address || inv.venue || "";
        if (billingAddr) {
            pdf.text(`Address: ${billingAddr}`, 14, billingY);
            billingY += 4.5;
        }

        if (inv.partnerPhone) {
            pdf.text(`Contact: ${inv.partnerPhone}`, 14, billingY);
            billingY += 4.5;
        }

        pdf.text(`Venue: ${inv.venue || "Standard Venue"}`, 14, billingY);
        billingY += 5;

        // TABLE 1: BOOKED EVENT ITEMS (Category & Subcategory)
        let runningY = Math.max(billingY + 2, 66);

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 41, 59);
        pdf.text(
            inv.templateName ? `1. BOOKED ITEMS (Category & Subcategory) - Template: ${inv.templateName}` : "1. BOOKED ITEMS (Category & Subcategory)",
            14,
            runningY
        );
        runningY += 3;

        let computedItemsSubtotal = 0;
        const itemRows = (inv.items || []).map((item: any, index: number) => {
            const baseAmount = item.rate || (item.vprice && Number(item.vprice) > 0
                ? Number(item.vprice)
                : item.hprice && Number(item.hprice) > 0
                    ? Number(item.hprice)
                    : Number(item.sprice || 0));

            const quantity = item.qty || (item?.verticalUnit
                ? Number(item?.verticalPcs || 0)
                : item?.horizontalUnit
                    ? Number(item.horizontalPcs || 0)
                    : 1);

            const unitStr = item.verticalUnit || item.horizontalUnit || "pcs";
            const lineTotal = item.lineTotal !== undefined ? Number(item.lineTotal) : baseAmount;
            computedItemsSubtotal += lineTotal;

            return [
                index + 1,
                item.categoryName || "-",
                item.subCategoryName || "-",
                `${quantity} ${unitStr}`,
                `INR ${Number(baseAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                `INR ${Number(lineTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
            ];
        });

        const itemsSubtotal = inv.itemsSubtotal !== undefined && Number(inv.itemsSubtotal) >= 0
            ? Number(inv.itemsSubtotal)
            : computedItemsSubtotal;

        autoTable(pdf, {
            startY: runningY,
            theme: "striped",
            margin: { left: 14, right: 14 },
            styles: {
                font: "helvetica",
                fontSize: 8.5,
                cellPadding: 3,
                textColor: [51, 65, 85],
            },
            headStyles: {
                fillColor: [241, 245, 249],
                textColor: [15, 23, 42],
                fontStyle: "bold",
            },
            head: [[
                "Sl.",
                "Category",
                "Sub-Category",
                "Qty",
                "Rate",
                "Total Amount",
            ]],
            body: itemRows.length > 0 ? itemRows : [["-", "No inventory items booked", "-", "-", "-", "INR 0.00"]],
            columnStyles: {
                0: { halign: "center", cellWidth: 12 },
                1: { cellWidth: 45 },
                2: { cellWidth: 45 },
                3: { halign: "center", cellWidth: 18 },
                4: { halign: "right", cellWidth: 30 },
                5: { halign: "right", cellWidth: 32 },
            },
        });

        runningY = (pdf as any).lastAutoTable.finalY + 8;

        // TABLE 2: ASSIGNED VEHICLES & LOGISTICS (Vehicle Assign)
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 41, 59);
        pdf.text("2. VEHICLE ASSIGNMENT & LOGISTICS", 14, runningY);
        runningY += 3;

        let computedVehiclesSubtotal = 0;
        const vehicleRows = (inv.vehicles || []).map((v: VehicleItem, index: number) => {
            const fuelCost = Number(v.fuelAmount || 0);
            const charges = Number(v.commission || 0);
            const total = v.totalCost !== undefined ? Number(v.totalCost) : (fuelCost + charges);
            computedVehiclesSubtotal += total;

            const fuelDesc = v.fuelQuantity > 0 ? `${v.fuelQuantity}L ${v.fuelType}` : (v.fuelType || "-");

            return [
                index + 1,
                v.vehicleName || "Vehicle",
                v.vehicleNumber || "-",
                v.ownerAgency || v.type || "Owner",
                fuelDesc,
                `INR ${fuelCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                `INR ${charges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                `INR ${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
            ];
        });

        const vehiclesSubtotal = inv.vehiclesSubtotal !== undefined && Number(inv.vehiclesSubtotal) >= 0
            ? Number(inv.vehiclesSubtotal)
            : computedVehiclesSubtotal;

        autoTable(pdf, {
            startY: runningY,
            theme: "striped",
            margin: { left: 14, right: 14 },
            styles: {
                font: "helvetica",
                fontSize: 8.5,
                cellPadding: 3,
                textColor: [51, 65, 85],
            },
            headStyles: {
                fillColor: [241, 245, 249],
                textColor: [15, 23, 42],
                fontStyle: "bold",
            },
            head: [[
                "Sl.",
                "Vehicle",
                "Vehicle No",
                "Agency / Owner",
                "Fuel Info",
                "Fuel Cost",
                "Charges",
                "Total Cost"
            ]],
            body: vehicleRows.length > 0 ? vehicleRows : [["-", "No vehicles assigned", "-", "-", "-", "-", "-", "INR 0.00"]],
            columnStyles: {
                0: { halign: "center", cellWidth: 10 },
                1: { cellWidth: 32 },
                2: { cellWidth: 28 },
                3: { cellWidth: 30 },
                4: { cellWidth: 26 },
                5: { halign: "right", cellWidth: 26 },
                6: { halign: "right", cellWidth: 20 },
                7: { halign: "right", cellWidth: 20 },
            },
        });

        // SUMMARY CARD
        const eventCost = Number(inv.eventCost || 0);
        const transportCost = Number(inv.transportCost || 0);
        const subtotal = Number(inv.amount || (itemsSubtotal + vehiclesSubtotal + eventCost + transportCost));
        const gstRate = Number(inv.gstRate || 0);
        const gstAmount = gstRate > 0 ? (subtotal * gstRate) / 100 : 0;
        const grandTotal = subtotal + gstAmount;
        const paidAmount = Number(inv.paidAmount || 0);
        const unpaidAmount = Math.max(0, grandTotal - paidAmount);

        const summaryLines: { label: string; value: string; color?: number[]; bold?: boolean }[] = [];

        if (itemsSubtotal > 0 || (inv.items && inv.items.length > 0)) {
            summaryLines.push({
                label: "Booked Items Subtotal:",
                value: `INR ${itemsSubtotal.toFixed(2)}`
            });
        }

        if (eventCost > 0) {
            summaryLines.push({
                label: "Event Base Cost:",
                value: `INR ${eventCost.toFixed(2)}`
            });
        }

        if (transportCost > 0) {
            summaryLines.push({
                label: "Transport Charges:",
                value: `INR ${transportCost.toFixed(2)}`
            });
        }

        if (vehiclesSubtotal > 0 || (inv.vehicles && inv.vehicles.length > 0)) {
            summaryLines.push({
                label: "Vehicle Logistics Subtotal:",
                value: `INR ${vehiclesSubtotal.toFixed(2)}`
            });
        }

        if (gstRate > 0) {
            summaryLines.push({
                label: "Subtotal (Excl. Tax):",
                value: `INR ${subtotal.toFixed(2)}`,
                bold: true
            });
            summaryLines.push({
                label: `GST (${gstRate}%):`,
                value: `INR ${gstAmount.toFixed(2)}`,
                color: [37, 99, 235],
                bold: true
            });
        }

        summaryLines.push({
            label: gstRate > 0 ? "Grand Total (Incl. GST):" : "Grand Total Bill:",
            value: `INR ${grandTotal.toFixed(2)}`,
            bold: true,
            color: [15, 23, 42]
        });

        summaryLines.push({
            label: "Paid to Date:",
            value: `INR ${paidAmount.toFixed(2)}`,
            color: [22, 163, 74] // green
        });

        summaryLines.push({
            label: "Balance Due / Unpaid:",
            value: `INR ${unpaidAmount.toFixed(2)}`,
            bold: true,
            color: [220, 38, 38] // red
        });

        let finalY = (pdf as any).lastAutoTable.finalY + 8;
        const boxHeight = summaryLines.length * 5.5 + 4;
        const pageHeight = pdf.internal.pageSize.height;
        if (finalY + boxHeight > pageHeight - 24) {
            pdf.addPage();
            finalY = 20;
        }

        // Left Box: Notes & Terms (if provided)
        if (inv.invoiceNotes) {
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(14, finalY, 86, boxHeight, 2, 2, "F");
            pdf.setDrawColor(226, 232, 240);
            pdf.roundedRect(14, finalY, 86, boxHeight, 2, 2, "D");

            pdf.setFontSize(8);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(30, 41, 59);
            pdf.text("Terms & Notes:", 18, finalY + 5);

            pdf.setFontSize(7.5);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 116, 139);
            const splitNotes = pdf.splitTextToSize(inv.invoiceNotes, 78);
            pdf.text(splitNotes, 18, finalY + 10);
        }

        // Right Box: Financial Summary
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(108, finalY, 88, boxHeight, 2, 2, "F");
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(108, finalY, 88, boxHeight, 2, 2, "D");

        let lineY = finalY + 5;
        summaryLines.forEach((line) => {
            pdf.setFontSize(8);
            pdf.setFont(line.bold ? "helvetica" : "helvetica", line.bold ? "bold" : "normal");
            if (line.color) {
                pdf.setTextColor(line.color[0], line.color[1], line.color[2]);
            } else {
                pdf.setTextColor(71, 85, 105);
            }
            pdf.text(line.label, 112, lineY);
            pdf.text(line.value, 192, lineY, { align: "right" });
            lineY += 5.5;
        });

        // Footer
        pdf.setDrawColor(241, 245, 249);
        pdf.line(14, pageHeight - 16, 196, pageHeight - 16);

        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.setFont("helvetica", "italic");
        pdf.text("Thank you for choosing us for your event management!", 14, pageHeight - 10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Generated by ${company?.companyName || "Management Pro"}`, 196, pageHeight - 10, { align: "right" });

        pdf.save(`Bill_${inv.id}.pdf`);
        toast.success(`Invoice ${inv.id} PDF downloaded!`);
    };

    // Filtered Invoices
    const filteredInvoices = invoices.filter((inv) => {
        const matchesSearch =
            inv.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.address?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" ||
            inv.status?.toUpperCase() === statusFilter.toUpperCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                    {company?.logo ? (
                        <img
                            src={`${images.baseUrl}/${company.logo}`}
                            alt={company.companyName}
                            className="h-14 w-14 object-contain rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1.5 shadow-sm"
                        />
                    ) : (
                        <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
                            <Building2 size={26} />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                                {company?.companyName || "Invoice & Billing Panel"}
                            </h1>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
                                Invoice & Billing
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {company?.address ? `${company.address} • ` : ""}
                            {company?.phone ? `Tel: ${company.phone} • ` : ""}
                            {company?.gstNumber ? `GST: ${company.gstNumber}` : "Consolidated Event Billing"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={getInvoice}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold shadow-sm transition-all"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Top Stat Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Invoices</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{invoices.length}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <FileText size={22} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Billed</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            ₹ {invoices.reduce((sum, i) => sum + Number(i.amount || 0), 0).toLocaleString("en-IN")}
                        </h3>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                        <DollarSign size={22} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Collected</p>
                        <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            ₹ {invoices.reduce((sum, i) => sum + Number(i.paidAmount || 0), 0).toLocaleString("en-IN")}
                        </h3>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <CheckCircle2 size={22} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Balance Due</p>
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                            ₹ {invoices.reduce((sum, i) => sum + Number(i.unpaidAmount || 0), 0).toLocaleString("en-IN")}
                        </h3>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                        <Clock size={22} />
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search invoice, customer, venue..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {["ALL", "UNPAID", "PARTIAL", "PAID"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === status
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">

                {/* ========================================================= */}
                {/* 1. MOBILE VIEW: Stacked Cards (Visible on mobile only)     */}
                {/* ========================================================= */}
                <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((inv) => {
                            const total = Number(inv.amount || 0);
                            const unpaid = Number(inv.unpaidAmount || 0);
                            const itemsTotal = Number(inv.itemsSubtotal || 0);
                            const vehicleTotal = Number(inv.vehiclesSubtotal || 0);
                            const isPaid = unpaid <= 0 && total > 0;
                            const isPartial = inv.paidAmount > 0 && unpaid > 0;

                            return (
                                <div key={inv.id} className="p-4 space-y-3">

                                    {/* Header: Invoice No, Customer & Payment Status */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                                                #{inv.id}
                                            </span>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                                                {inv.customer || "Customer"}
                                            </h3>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                <MapPin size={12} />
                                                {inv.venue || inv.address || "Venue"}
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${isPaid
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                : isPartial
                                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                            }`}>
                                            {isPaid ? "Paid" : isPartial ? "Partial" : "Unpaid"}
                                        </span>
                                    </div>

                                    {/* Metadata Grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Event Date</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1 mt-0.5">
                                                <Calendar size={12} />
                                                {inv.eventDate ? new Date(inv.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "NA"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Balance Due</span>
                                            <span className={`font-mono font-bold ${unpaid > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                                ₹ {unpaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Booked Items</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium font-mono">
                                                ₹ {itemsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 uppercase font-medium">Vehicle Logistics</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium font-mono">
                                                ₹ {vehicleTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {inv.eventCost !== undefined && Number(inv.eventCost) > 0 && (
                                            <div>
                                                <span className="block text-[10px] text-gray-400 uppercase font-medium">Event Cost</span>
                                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                                                    ₹ {Number(inv.eventCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        {inv.transportCost !== undefined && Number(inv.transportCost) > 0 && (
                                            <div>
                                                <span className="block text-[10px] text-gray-400 uppercase font-medium">Transport (TC)</span>
                                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                                                    ₹ {Number(inv.transportCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        <div className="col-span-2 pt-1 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                            <span className="text-[11px] text-gray-500 uppercase font-bold">Total Bill Amount</span>
                                            <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                                                ₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                        <button
                                            onClick={() => handleOpenBillPay(inv)}
                                            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                                        >
                                            <FaFileInvoiceDollar size={13} /> Pay
                                        </button>
                                        <button
                                            onClick={() => handleOpenPartnerModal(inv)}
                                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg transition-all"
                                            title="Add / Edit Partner & GST Details"
                                        >
                                            <Building2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedInvoice(inv)}
                                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg transition-all"
                                            title="View Bill Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => downloadPDF(inv)}
                                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg transition-all"
                                            title="Download PDF"
                                        >
                                            <Download size={16} />
                                        </button>
                                        {inv.status !== "Cancelled" && (
                                            <button
                                                onClick={() => handleCancel(inv.id)}
                                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-all"
                                                title="Cancel Invoice"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );
                        })
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <AlertCircle size={32} className="mx-auto mb-2 text-gray-300" />
                            No invoices found matching your criteria.
                        </div>
                    )}
                </div>


                {/* ========================================================= */}
                {/* 2. DESKTOP VIEW: Traditional Table (Visible on md+ screens) */}
                {/* ========================================================= */}
                <div className="hidden md:block overflow-x-hidden w-full max-w-full">
                    <table className="w-full table-fixed border-collapse text-left">
                        <thead>
                            <tr className="bg-gray-100/75 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                <th className="w-[6%] p-2 text-start whitespace-normal break-words">Invoice No</th>
                                <th className="w-[16%] p-2 text-start whitespace-normal break-words">Customer & Venue</th>
                                <th className="w-[8%] p-2 text-start whitespace-normal break-words">Event Date</th>
                                <th className="w-[9%] p-2 text-right whitespace-normal break-words">Booked Items</th>
                                <th className="w-[9%] p-2 text-right whitespace-normal break-words">Event Cost</th>
                                <th className="w-[7%] p-2 text-right whitespace-normal break-words">Transport</th>
                                <th className="w-[9%] p-2 text-right whitespace-normal break-words">Vehicle Logistics</th>
                                <th className="w-[9%] p-2 text-right whitespace-normal break-words">Total Bill</th>
                                <th className="w-[9%] p-2 text-right whitespace-normal break-words">Balance Due</th>
                                <th className="w-[7%] p-2 text-center whitespace-normal break-words">Status</th>
                                <th className="w-[11%] p-2 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((inv) => {
                                    const total = Number(inv.amount || 0);
                                    const unpaid = Number(inv.unpaidAmount || 0);
                                    const itemsTotal = Number(inv.itemsSubtotal || 0);
                                    const vehicleTotal = Number(inv.vehiclesSubtotal || 0);
                                    const eventCostVal = Number(inv.eventCost || 0);
                                    const transportCostVal = Number(inv.transportCost || 0);
                                    const isPaid = unpaid <= 0 && total > 0;
                                    const isPartial = inv.paidAmount > 0 && unpaid > 0;

                                    return (
                                        <tr
                                            key={inv.id}
                                            className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                                        >
                                            <td className="w-[6%] p-2 font-bold text-blue-600 dark:text-blue-400 text-xs align-top whitespace-normal break-words">
                                                {inv.id}
                                            </td>

                                            <td className="w-[16%] p-2 whitespace-normal break-words align-top leading-tight">
                                                <div className="font-semibold text-gray-900 dark:text-white text-xs break-words" title={inv.customer || "Customer"}>
                                                    {inv.customer || "Customer"}
                                                </div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1 mt-0.5 break-words leading-tight" title={inv.venue || inv.address || "Venue"}>
                                                    <MapPin size={10} className="shrink-0 mt-0.5" />
                                                    <span className="break-words">{inv.venue || inv.address || "Venue"}</span>
                                                </div>
                                            </td>

                                            <td className="w-[8%] p-2 text-xs text-gray-600 dark:text-gray-400 align-top whitespace-normal break-words leading-tight">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={11} className="shrink-0" />
                                                    <span>{inv.eventDate ? new Date(inv.eventDate).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric"
                                                    }) : "NA"}</span>
                                                </div>
                                            </td>

                                            <td className="w-[9%] p-2 text-right font-medium text-gray-700 dark:text-gray-300 align-top text-xs whitespace-normal break-words">
                                                <div className="flex items-center justify-end gap-1 text-xs font-mono">
                                                    <Layers size={11} className="text-blue-500 shrink-0" />
                                                    ₹ {itemsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </div>
                                                <span className="text-[10px] text-gray-400">
                                                    ({inv.items?.length || 0} items)
                                                </span>
                                            </td>

                                            <td className="w-[9%] p-2 text-right font-medium text-gray-700 dark:text-gray-300 align-top text-xs whitespace-normal break-words">
                                                {eventCostVal > 0 ? (
                                                    <div>
                                                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                                                            ₹ {eventCostVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                        </div>
                                                        {inv.templateName && (
                                                            <span className="text-[10px] text-gray-400 block truncate max-w-[100px] ml-auto" title={inv.templateName}>
                                                                {inv.templateName}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>

                                            <td className="w-[7%] p-2 text-right font-medium text-gray-700 dark:text-gray-300 align-top text-xs whitespace-normal break-words">
                                                {transportCostVal > 0 ? (
                                                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                                                        ₹ {transportCostVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>

                                            <td className="w-[9%] p-2 text-right font-medium text-gray-700 dark:text-gray-300 align-top text-xs whitespace-normal break-words">
                                                {vehicleTotal > 0 ? (
                                                    <div>
                                                        <div className="flex items-center justify-end gap-1 text-xs font-mono">
                                                            <Truck size={11} className="text-amber-500 shrink-0" />
                                                            ₹ {vehicleTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400">
                                                            ({inv.vehicles?.length || 0} vehicles)
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>

                                            <td className="w-[9%] p-2 text-right font-bold text-gray-900 dark:text-white text-xs align-top font-mono whitespace-normal break-words">
                                                ₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </td>

                                            <td className="w-[9%] p-2 text-right font-bold align-top whitespace-normal break-words font-mono">
                                                <span
                                                    className={`px-1.5 py-0.5 rounded text-[11px] block ${unpaid > 0
                                                            ? "text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400"
                                                            : "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        }`}
                                                >
                                                    ₹ {unpaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>

                                            <td className="w-[7%] p-2 text-center align-top whitespace-normal break-words">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isPaid
                                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                            : isPartial
                                                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                                        }`}
                                                >
                                                    {isPaid ? "Paid" : isPartial ? "Partial" : "Unpaid"}
                                                </span>
                                            </td>

                                            <td className="w-[11%] p-2 text-center align-top">
                                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                                    <button
                                                        onClick={() => handleOpenBillPay(inv)}
                                                        title="Pay Bill"
                                                        className="flex items-center gap-0.5 bg-indigo-600 hover:bg-indigo-700 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer"
                                                    >
                                                        <FaFileInvoiceDollar size={10} />
                                                        <span>Pay</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleOpenPartnerModal(inv)}
                                                        title="Add / Edit Partner & GST Details"
                                                        className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded transition cursor-pointer"
                                                    >
                                                        <Building2 size={13} />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedInvoice(inv)}
                                                        title="View Bill Details"
                                                        className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded transition cursor-pointer"
                                                    >
                                                        <Eye size={13} />
                                                    </button>

                                                    <button
                                                        onClick={() => downloadPDF(inv)}
                                                        title="Print / Download PDF"
                                                        className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded transition cursor-pointer"
                                                    >
                                                        <Download size={13} />
                                                    </button>

                                                    {inv.status !== "Cancelled" && (
                                                        <button
                                                            onClick={() => handleCancel(inv.id)}
                                                            title="Cancel Invoice"
                                                            className="p-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded transition cursor-pointer"
                                                        >
                                                            <XCircle size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={11} className="text-center py-12 text-gray-400">
                                        <AlertCircle size={32} className="mx-auto mb-2 text-gray-300" />
                                        No invoices found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* VIEW BILL & INVOICE DETAILS MODAL                                         */}
            {/* ========================================================================= */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-99999 flex items-center justify-center p-3 sm:p-5 overflow-hidden overscroll-none">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[92vh] flex flex-col" style={{ transform: "translateZ(0)" }}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        Invoice Details & Bill Breakdown
                                    </h2>
                                    <p className="text-xs text-blue-100">
                                        {selectedInvoice.id} • Customer: {selectedInvoice.customer}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6 overflow-y-auto max-h-[82vh] custom-scrollbar space-y-6 flex-1">
                            {/* Official Company Letterhead / Header */}
                            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    {company?.logo ? (
                                        <img
                                            src={`${images.baseUrl}/${company.logo}`}
                                            alt={company.companyName}
                                            className="h-16 w-16 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-white p-1 shadow-xs"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                            <Building2 size={32} />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                                            {company?.companyName || "Management Pro"}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {company?.address || "Address not provided"}
                                        </p>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300 mt-1">
                                            {company?.phone && (
                                                <span>
                                                    Tel: <span className="font-semibold">{company.phone}</span>
                                                </span>
                                            )}
                                            {company?.email && (
                                                <span>
                                                    Email: <span className="font-semibold">{company.email}</span>
                                                </span>
                                            )}
                                            {company?.gstNumber && (
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    GSTIN: {company.gstNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800 flex flex-col md:items-end">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 w-fit">
                                        TAX INVOICE
                                    </span>
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1.5 font-mono">
                                        {selectedInvoice.id}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Issued: {selectedInvoice.date ? new Date(selectedInvoice.date).toLocaleDateString("en-IN") : "NA"}
                                    </p>
                                    <button
                                        onClick={() => downloadPDF(selectedInvoice)}
                                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                                    >
                                        <Download size={13} />
                                        Download PDF
                                    </button>
                                </div>
                            </div>

                            {/* Partner & Billing Details Card */}
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700/80">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                            <Building2 size={13} className="text-blue-600" /> Billed To / Partner Details
                                        </span>
                                        {selectedInvoice.partnerGst && (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                GSTIN: {selectedInvoice.partnerGst}
                                            </span>
                                        )}
                                        {Number(selectedInvoice.gstRate || 0) > 0 && (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                                                GST Rate: {selectedInvoice.gstRate}%
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleOpenPartnerModal(selectedInvoice)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-xs transition cursor-pointer"
                                    >
                                        <Pencil size={12} />
                                        Edit Partner / GST Details
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <span className="text-gray-400 uppercase font-semibold">Billed Party / Partner:</span>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">
                                            {selectedInvoice.partnerName || selectedInvoice.customer}
                                        </p>
                                        {selectedInvoice.partnerName && selectedInvoice.customer && selectedInvoice.partnerName !== selectedInvoice.customer && (
                                            <span className="text-[11px] text-gray-500 block">Customer: {selectedInvoice.customer}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-gray-400 uppercase font-semibold">Partner GSTIN & Contact:</span>
                                        <p className="font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5 font-mono">
                                            {selectedInvoice.partnerGst || "No GST Added"}
                                        </p>
                                        {selectedInvoice.partnerPhone && (
                                            <span className="text-[11px] text-gray-500 block">Tel: {selectedInvoice.partnerPhone}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-gray-400 uppercase font-semibold">Event Date:</span>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">
                                            {selectedInvoice.eventDate ? new Date(selectedInvoice.eventDate).toLocaleDateString("en-IN") : "NA"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 uppercase font-semibold">Billing Address / Venue:</span>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">
                                            {selectedInvoice.partnerAddress || selectedInvoice.address || selectedInvoice.venue || "NA"}
                                        </p>
                                    </div>
                                </div>

                                {selectedInvoice.invoiceNotes && (
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700/60 flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold shrink-0 text-[11px] uppercase text-gray-400">Terms / Notes:</span>
                                        <p className="italic text-xs">{selectedInvoice.invoiceNotes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Section 1: Booked Event Items (Category & Subcategory) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Layers size={16} className="text-blue-600" />
                                        1. Booked Items & Materials (Category & Subcategory)
                                    </h3>
                                    <span className="text-xs font-semibold text-gray-500">
                                        Subtotal: ₹ {Number(selectedInvoice.itemsSubtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {selectedInvoice.templateName && (
                                    <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 shadow-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px] tracking-wider uppercase shrink-0">
                                                TEMPLATE
                                            </span>
                                            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                                                Package Template: {selectedInvoice.templateName}
                                            </span>
                                        </div>
                                        {Number(selectedInvoice.eventCost || 0) > 0 && (
                                            <span className="text-xs font-mono font-bold text-indigo-900 dark:text-indigo-200">
                                                Package Base: ₹ {Number(selectedInvoice.eventCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold uppercase">
                                            <tr>
                                                <th className="p-2.5 text-center">Sl</th>
                                                <th className="p-2.5">Category</th>
                                                <th className="p-2.5">Sub-Category</th>
                                                <th className="p-2.5 text-center">Qty</th>
                                                <th className="p-2.5 text-right">Unit Rate</th>
                                                <th className="p-2.5 text-right">Line Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                                                selectedInvoice.items.map((item: any, i: number) => {
                                                    const rate = item.rate || (item.vprice && Number(item.vprice) > 0
                                                        ? Number(item.vprice)
                                                        : item.hprice && Number(item.hprice) > 0
                                                            ? Number(item.hprice)
                                                            : Number(item.sprice || 0));
                                                    const lineTotal = item.lineTotal !== undefined ? Number(item.lineTotal) : rate;
                                                    const qty = item.qty || (item?.verticalUnit ? item?.verticalPcs : item?.horizontalUnit ? item.horizontalPcs : 1);

                                                    return (
                                                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                                            <td className="p-2.5 text-center text-gray-400">{i + 1}</td>
                                                            <td className="p-2.5 font-medium text-gray-900 dark:text-white">
                                                                {item.categoryName || "-"}
                                                            </td>
                                                            <td className="p-2.5 text-gray-600 dark:text-gray-300">
                                                                {item.subCategoryName || "-"}
                                                            </td>
                                                            <td className="p-2.5 text-center font-bold">
                                                                {qty} {item.verticalUnit || item.horizontalUnit || "pcs"}
                                                            </td>
                                                            <td className="p-2.5 text-right font-mono text-gray-700 dark:text-gray-300">
                                                                ₹ {Number(rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="p-2.5 text-right font-bold font-mono text-gray-900 dark:text-white">
                                                                ₹ {Number(lineTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-4 text-gray-400">
                                                        No materials booked in calendar.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Section 2: Event Cost & Transport Charges (If added) */}
                            {(Number(selectedInvoice.eventCost || 0) > 0 || Number(selectedInvoice.transportCost || 0) > 0) && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Calendar size={16} className="text-indigo-600" />
                                            2. Event Cost & Transport Charges
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Number(selectedInvoice.eventCost || 0) > 0 && (
                                            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
                                                        Event Cost {selectedInvoice.templateName ? `(${selectedInvoice.templateName})` : ""}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Event base booking / package amount
                                                    </span>
                                                </div>
                                                <span className="text-base font-extrabold text-indigo-900 dark:text-indigo-100 font-mono">
                                                    ₹ {Number(selectedInvoice.eventCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        {Number(selectedInvoice.transportCost || 0) > 0 && (
                                            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                                                        Transport Charges (TC)
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Event logistics transportation charges
                                                    </span>
                                                </div>
                                                <span className="text-base font-extrabold text-emerald-900 dark:text-emerald-100 font-mono">
                                                    ₹ {Number(selectedInvoice.transportCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Assigned Vehicles Logistics */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Truck size={16} className="text-amber-500" />
                                        3. Assigned Fleet & Logistics (From Vehicle Assign)
                                    </h3>
                                    <span className="text-xs font-semibold text-gray-500">
                                        Subtotal: ₹ {Number(selectedInvoice.vehiclesSubtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">

                                    {/* ========================================================= */}
                                    {/* 1. MOBILE VIEW: Stacked Cards (Visible on mobile only)     */}
                                    {/* ========================================================= */}
                                    <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                                        {selectedInvoice.vehicles && selectedInvoice.vehicles.length > 0 ? (
                                            selectedInvoice.vehicles.map((v: VehicleItem, i: number) => {
                                                const fuel = Number(v.fuelAmount || 0);
                                                const charges = Number(v.commission || 0);
                                                const total = v.totalCost !== undefined ? Number(v.totalCost) : (fuel + charges);

                                                return (
                                                    <div key={i} className="p-4 space-y-3">
                                                        {/* Header: Sl. No & Vehicle Name */}
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <span className="text-xs font-semibold text-gray-400">#{i + 1}</span>
                                                                <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                                                                    {v.vehicleName || "Vehicle"}
                                                                </h4>
                                                                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                                    {v.vehicleNumber || "-"}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="block text-[10px] text-gray-400 uppercase font-medium">Total Cost</span>
                                                                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                                                                    ₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Metadata Grid */}
                                                        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                                                            <div>
                                                                <span className="block text-[10px] text-gray-400 uppercase font-medium">Agency / Driver</span>
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium">{v.ownerAgency || v.type || "Owner"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[10px] text-gray-400 uppercase font-medium">Fuel Details</span>
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                                    {v.fuelQuantity > 0 ? `${v.fuelQuantity} L (${v.fuelType})` : (v.fuelType || "-")}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[10px] text-gray-400 uppercase font-medium">Fuel Cost</span>
                                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                                    ₹ {fuel.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[10px] text-gray-400 uppercase font-medium">Vehicle Charges</span>
                                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                                    ₹ {charges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-8 text-center text-gray-400 text-sm">
                                                No vehicles assigned to this event.
                                            </div>
                                        )}
                                    </div>


                                    {/* ========================================================= */}
                                    {/* 2. DESKTOP VIEW: Traditional Table (Visible on md+ screens) */}
                                    {/* ========================================================= */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold uppercase">
                                                <tr>
                                                    <th className="p-2.5 text-center">Sl</th>
                                                    <th className="p-2.5">Vehicle</th>
                                                    <th className="p-2.5">Vehicle No</th>
                                                    <th className="p-2.5">Agency / Driver</th>
                                                    <th className="p-2.5 text-center">Fuel Details</th>
                                                    <th className="p-2.5 text-right">Fuel Cost</th>
                                                    <th className="p-2.5 text-right">Vehicle Charges</th>
                                                    <th className="p-2.5 text-right">Total Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {selectedInvoice.vehicles && selectedInvoice.vehicles.length > 0 ? (
                                                    selectedInvoice.vehicles.map((v: VehicleItem, i: number) => {
                                                        const fuel = Number(v.fuelAmount || 0);
                                                        const charges = Number(v.commission || 0);
                                                        const total = v.totalCost !== undefined ? Number(v.totalCost) : (fuel + charges);

                                                        return (
                                                            <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                                                <td className="p-2.5 text-center text-gray-400">{i + 1}</td>
                                                                <td className="p-2.5 font-medium text-gray-900 dark:text-white">
                                                                    {v.vehicleName || "Vehicle"}
                                                                </td>
                                                                <td className="p-2.5 font-mono text-gray-600 dark:text-gray-300">
                                                                    {v.vehicleNumber || "-"}
                                                                </td>
                                                                <td className="p-2.5 text-gray-600 dark:text-gray-300">
                                                                    {v.ownerAgency || v.type || "Owner"}
                                                                </td>
                                                                <td className="p-2.5 text-center text-gray-600 dark:text-gray-400">
                                                                    {v.fuelQuantity > 0 ? `${v.fuelQuantity} L (${v.fuelType})` : (v.fuelType || "-")}
                                                                </td>
                                                                <td className="p-2.5 text-right font-mono">
                                                                    ₹ {fuel.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td className="p-2.5 text-right font-mono">
                                                                    ₹ {charges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td className="p-2.5 text-right font-bold font-mono text-gray-900 dark:text-white">
                                                                    ₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={8} className="text-center py-4 text-gray-400">
                                                            No vehicles assigned to this event.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Consolidated Summary Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50/40 dark:from-gray-800/40 dark:to-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-gray-700 space-y-2">
                                {Number(selectedInvoice.itemsSubtotal || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                                        <span>Booked Items Subtotal (Category & Subcategory):</span>
                                        <span className="font-semibold font-mono">
                                            ₹ {Number(selectedInvoice.itemsSubtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}

                                {Number(selectedInvoice.eventCost || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                                        <span>Event Base Cost {selectedInvoice.templateName ? `(${selectedInvoice.templateName})` : ""}:</span>
                                        <span className="font-semibold font-mono text-indigo-600 dark:text-indigo-400">
                                            ₹ {Number(selectedInvoice.eventCost || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}

                                {Number(selectedInvoice.transportCost || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                                        <span>Transport Charges (TC):</span>
                                        <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                                            ₹ {Number(selectedInvoice.transportCost || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}

                                {Number(selectedInvoice.vehiclesSubtotal || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                                        <span>Vehicle Logistics Subtotal (Assigned Fleet):</span>
                                        <span className="font-semibold font-mono text-amber-600 dark:text-amber-400">
                                            ₹ {Number(selectedInvoice.vehiclesSubtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}

                                {Number(selectedInvoice.gstRate || 0) > 0 && (() => {
                                    const sub = Number(selectedInvoice.amount || 0);
                                    const gst = (sub * Number(selectedInvoice.gstRate)) / 100;
                                    return (
                                        <>
                                            <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                <span>Subtotal (Excl. Tax):</span>
                                                <span className="font-mono">₹ {sub.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-purple-600 dark:text-purple-400 font-semibold">
                                                <span>GST ({selectedInvoice.gstRate}%):</span>
                                                <span className="font-mono">₹ {gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </>
                                    );
                                })()}

                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">
                                        {Number(selectedInvoice.gstRate || 0) > 0 ? "Grand Total (Incl. GST):" : "Grand Total Bill:"}
                                    </span>
                                    <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                                        ₹ {(() => {
                                            const sub = Number(selectedInvoice.amount || 0);
                                            const gst = Number(selectedInvoice.gstRate || 0) > 0 ? (sub * Number(selectedInvoice.gstRate)) / 100 : 0;
                                            return (sub + gst).toLocaleString("en-IN", { minimumFractionDigits: 2 });
                                        })()}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                    <span>Total Paid to Date:</span>
                                    <span className="font-mono">
                                        ₹ {Number(selectedInvoice.paidAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm text-red-600 dark:text-red-400 font-bold">
                                    <span>Balance Due / Unpaid:</span>
                                    <span className="font-mono">
                                        ₹ {(() => {
                                            const sub = Number(selectedInvoice.amount || 0);
                                            const gst = Number(selectedInvoice.gstRate || 0) > 0 ? (sub * Number(selectedInvoice.gstRate)) / 100 : 0;
                                            const tot = sub + gst;
                                            const paid = Number(selectedInvoice.paidAmount || 0);
                                            return Math.max(0, tot - paid).toLocaleString("en-IN", { minimumFractionDigits: 2 });
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 dark:bg-gray-800/80 p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                Close
                            </button>

                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => handleOpenPartnerModal(selectedInvoice)}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-semibold transition cursor-pointer"
                                    title="Add / Edit Partner & GST Details"
                                >
                                    <Building2 size={15} />
                                    Partner & GST
                                </button>

                                <button
                                    onClick={() => handleOpenBillPay(selectedInvoice)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
                                >
                                    <FaFileInvoiceDollar size={15} />
                                    Pay Bill
                                </button>

                                <button
                                    onClick={() => downloadPDF(selectedInvoice)}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
                                >
                                    <Printer size={16} />
                                    Download / Print PDF Bill
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* BILL PAY MODAL                                                            */}
            {/* ========================================================================= */}
            {bill && payingInvoice && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-99999 flex items-center justify-center p-3 sm:p-5 overflow-hidden overscroll-none">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[92vh] flex flex-col" style={{ transform: "translateZ(0)" }}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/10">
                                    <FaFileInvoiceDollar size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Record Bill Payment</h2>
                                    <p className="text-xs text-indigo-100">
                                        {payingInvoice.id} • Customer: {payingInvoice.customer}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setBill("");
                                    setPayingInvoice(null);
                                }}
                                className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[82vh] custom-scrollbar flex-1">
                            {/* Summary Card */}
                            {(() => {
                                const totalPaid = paymentHistory?.reduce((sum, item) => sum + Number(item.price), 0) || 0;
                                const totalBill = Number(payingInvoice.amount || 0);
                                const unpaid = Math.max(0, totalBill - totalPaid);

                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-center">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Bill Amount</p>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                                ₹ {totalBill.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </h4>
                                            <span className="text-[10px] text-gray-400">
                                                (Booked Items + Event & Transport + Vehicles)
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-xs text-emerald-600 uppercase font-semibold">Total Paid to Date</p>
                                            <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                                ₹ {totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </h4>
                                        </div>

                                        <div>
                                            <p className="text-xs text-red-600 uppercase font-semibold">Current Unpaid Balance</p>
                                            <h4 className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                                                ₹ {unpaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </h4>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Payment Input Form */}
                            {(() => {
                                const totalPaid = paymentHistory?.reduce((sum, item) => sum + Number(item.price), 0) || 0;
                                const totalBill = Number(payingInvoice.amount || 0);
                                const unpaid = Math.max(0, totalBill - totalPaid);

                                return (
                                    <div className="p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/20">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                                            Enter Payment Amount (₹)
                                        </label>

                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            <div className="relative flex-1 w-full">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    value={remaining}
                                                    onChange={(e) => setRemaining(e.target.value === "" ? "" : Number(e.target.value))}
                                                    placeholder={`Max unpaid: ₹${unpaid.toFixed(2)}`}
                                                    max={unpaid}
                                                    disabled={unpaid <= 0 || paying}
                                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setRemaining(unpaid)}
                                                disabled={unpaid <= 0 || paying}
                                                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-indigo-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                                            >
                                                Pay Full Balance
                                            </button>

                                            <button
                                                onClick={PayBill}
                                                disabled={unpaid <= 0 || paying || !remaining}
                                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                                            >
                                                {paying ? (
                                                    <>
                                                        <RefreshCw size={16} className="animate-spin" />
                                                        Recording...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaFileInvoiceDollar size={15} />
                                                        Record Payment
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Payment History Log */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                    Payment Transaction History
                                </h4>

                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto w-full custom-scrollbar">
                                    <table className="w-full min-w-[340px] text-xs text-left">
                                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold uppercase">
                                            <tr>
                                                <th className="p-2.5">Date Paid</th>
                                                <th className="p-2.5 text-right">Amount Paid</th>
                                                <th className="p-2.5 text-right">Remaining Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {paymentHistory && paymentHistory.length > 0 ? (
                                                paymentHistory.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                                        <td className="p-2.5 text-gray-600 dark:text-gray-400">
                                                            {new Date(item.paid_date).toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </td>
                                                        <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                            + ₹ {Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-2.5 text-right font-mono text-gray-700 dark:text-gray-300">
                                                            ₹ {Number(item.remaining).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-4 text-gray-400">
                                                        No payments recorded yet for this invoice.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 dark:bg-gray-800/80 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => {
                                    setBill("");
                                    setPayingInvoice(null);
                                }}
                                className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Partner & GST Details Modal */}
            {partnerModalOpen && editingPartnerInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col my-8">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Partner & GST Billing Details
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Invoice #{editingPartnerInvoice.id} • {editingPartnerInvoice.customer || "Client"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPartnerModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSavePartnerDetails} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Live calculation banner */}
                            {(() => {
                                const baseSubtotal = Number(editingPartnerInvoice.amount || 0);
                                const currentGstRate = Number(partnerForm.gstRate || 0);
                                const gstAmount = (baseSubtotal * currentGstRate) / 100;
                                const grandTotal = baseSubtotal + gstAmount;

                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 text-center">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Base Subtotal</p>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                ₹ {baseSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                                                GST ({currentGstRate}%)
                                            </p>
                                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                + ₹ {gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Final Bill Total</p>
                                            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                                ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Partner / Company Name & GSTIN */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Partner / Client Name
                                    </label>
                                    <input
                                        type="text"
                                        value={partnerForm.partnerName}
                                        onChange={(e) => setPartnerForm(prev => ({ ...prev, partnerName: e.target.value }))}
                                        placeholder="e.g. Royal Decorators / Corporate Client"
                                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Partner GSTIN Number
                                    </label>
                                    <input
                                        type="text"
                                        value={partnerForm.partnerGst}
                                        onChange={(e) => setPartnerForm(prev => ({ ...prev, partnerGst: e.target.value.toUpperCase() }))}
                                        placeholder="e.g. 29ABCDE1234F1Z5"
                                        maxLength={20}
                                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono tracking-wider focus:ring-2 focus:ring-indigo-500 outline-none transition uppercase"
                                    />
                                </div>
                            </div>

                            {/* Contact & GST Rate */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Partner Phone / Contact
                                    </label>
                                    <input
                                        type="text"
                                        value={partnerForm.partnerPhone}
                                        onChange={(e) => setPartnerForm(prev => ({ ...prev, partnerPhone: e.target.value }))}
                                        placeholder="e.g. +91 98765 43210"
                                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        GST Rate (%)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={partnerForm.gstRate}
                                            onChange={(e) => setPartnerForm(prev => ({ ...prev, gstRate: e.target.value }))}
                                            placeholder="0"
                                            className="w-24 px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        />
                                        <div className="flex items-center gap-1">
                                            {[0, 5, 12, 18, 28].map((rate) => (
                                                <button
                                                    key={rate}
                                                    type="button"
                                                    onClick={() => setPartnerForm(prev => ({ ...prev, gstRate: rate }))}
                                                    className={`px-2 py-1.5 text-xs font-semibold rounded-lg border transition ${
                                                        Number(partnerForm.gstRate) === rate
                                                            ? "bg-indigo-600 text-white border-indigo-600"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {rate}%
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Partner Address */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Partner Billing Address
                                </label>
                                <textarea
                                    rows={2}
                                    value={partnerForm.partnerAddress}
                                    onChange={(e) => setPartnerForm(prev => ({ ...prev, partnerAddress: e.target.value }))}
                                    placeholder="e.g. Flat/Plot No., Road, City, State, PIN"
                                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                                />
                            </div>

                            {/* Invoice Notes / Terms */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Invoice Terms & Additional Notes (Appears on PDF & Bill)
                                </label>
                                <textarea
                                    rows={3}
                                    value={partnerForm.invoiceNotes}
                                    onChange={(e) => setPartnerForm(prev => ({ ...prev, invoiceNotes: e.target.value }))}
                                    placeholder="e.g. Terms: 100% advance before dispatch. Any damage to materials during the event will be charged as per replacement costs."
                                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setPartnerModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingPartner}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition shadow-md shadow-indigo-600/20"
                                >
                                    {savingPartner ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            Save & Update Bill
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}