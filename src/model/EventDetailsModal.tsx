import { Modal } from "../components/ui/modal";
import Detail from "../hooks/Detail";


interface EventDetails {
    id: number;
    design_id: number;
    c_name: string;
    vanus: string;
    doe: string;
    v_location: string;
    v_a_d: string;
    nodb: number;
    pob: string;
    tc: string;
    sr: string;
    amount: number;
    status: string;
    created_at: string;
}
interface BookedItem {
    id: number;
    categories_name: string;
    subCategories_name: string;
    width: string;
    height: string;
    qt: number;
}

export default function EventDetailsModal({
    isOpen,
    onClose,
    data,
    bookedItems
}: {
    isOpen: boolean;
    onClose: () => void;
    data: EventDetails | null;
    bookedItems: Record<number, BookedItem[]>; 
}) {
    if (!isOpen || !data) return null;

    const formatDate = (date: string) =>
        new Date(date).toLocaleString();



    const parseValue = (val: string | null | undefined): number => {
    if (!val) return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
};

 const totalArea = bookedItems[data.id]?.reduce((sum, item) => {
    const width = parseValue(item.width);
    const height = parseValue(item.height);
    const totalsum =  sum + (width * height) * data.amount +  item.qt * data.amount
    return totalsum;
}, 0) || 0;
    




    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}

            className="max-w-4xl w-full mx-auto p-0 rounded-2xl overflow-hidden [&>button]:hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h2 className="text-lg font-semibold text-white">
                    Event Details
                </h2>
                <button
                    onClick={onClose}
                    className="text-white hover:text-red-200 text-xl"
                >
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-gray-50 space-y-6">

                {/* Top Highlight Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-xs text-gray-500">Client</p>
                        <p className="font-semibold text-gray-800">{data.c_name}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-xs text-gray-500">Event Type</p>
                        <p className="font-semibold text-gray-800">{data.vanus}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-xs text-gray-500">Total Cost</p>
                        <p className="font-semibold text-blue-600 text-lg">₹ {totalArea+ data.amount}</p>
                    </div>
                </div>

                {/* Details Section */}
                <div className="bg-white rounded-xl shadow p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                        Event Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <Detail label="Event Date" value={formatDate(data.doe)} />
                        <Detail label="Arrival Date" value={formatDate(data.v_a_d)} />
                        <Detail label="Venue Location" value={data.v_location} />
                        <Detail label="Place of Booking" value={data.pob} />
                        <Detail label="No. of Days" value={data.nodb} />
                        <Detail label="Transport Cost" value={`₹ ${data.tc}`} />
                        <Detail label="Special Request" value={data.sr} />
                        <Detail label="Created At" value={formatDate(data.created_at)} />
                    </div>
                </div>

                {/* Status Section */}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow">
                    <span className="text-sm text-gray-600">Status</span>
                    <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${data.status === "1"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                            }`}
                    >
                        {data.status === "1" ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 bg-white border-t">
                <button
                    onClick={onClose}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}