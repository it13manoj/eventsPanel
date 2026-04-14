



export default function EventTable() {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

            <div className="px-5 py-4 border-b flex justify-between items-center dark:border-white/[0.05]">
                <h2 className="text-lg font-semibold">📅 Event Bookings</h2>
            </div>

            <div className="max-w-full overflow-x-auto">
                <table className="min-w-full">

                    {/* Header */}
                    <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                        <tr>
                            <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Sr.No.</th>
                            <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Client Name</th>
                            <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Venue</th>
                            <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Event Date</th>
                            <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                            <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">No. Of Days</th>
                            <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Budget</th>
                            <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Team</th>
                            <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Status</th>

                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

                        <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">

                            {/* Sr. No. */}
                            <td className="px-5 py-4 text-gray-500">
                            </td>

                            {/* Client */}
                            <td className="px-5 py-4">
                                <div className="font-medium text-gray-800 dark:text-white">
                                </div>
                            </td>

                            {/* Venue */}
                            <td className="px-5 py-4 text-gray-500">
                            </td>

                            {/* Date */}
                            <td className="px-5 py-4 text-gray-500">
                            </td>

                            {/* Location */}
                            <td className="px-5 py-4 text-gray-500">
                            </td>

                            {/* No. of days */}
                            <td className="px-5 py-4 text-gray-500">
                            </td>

                            {/* Budget */}
                            <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                            </td>

                            {/* Team */}
                            <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">

                                <button className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    Assign Team
                                </button>

                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                                <span
                                    className={`px-3 py-1 text-xs font-medium rounded-full $
                                        )}`}
                                >

                                </span>
                            </td>

                        </tr>

                    </tbody>

                </table>
            </div>
        </div>
    );
}