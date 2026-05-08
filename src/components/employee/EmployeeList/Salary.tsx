
import { useEffect, useState } from "react";
import apiClient from "../../../hooks/api/apiClient";


export default function Salary() {
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [salaryData, setSalaryData] = useState<any[]>([]);

    const [EmployeeList, setEmployeeList] = useState([{
        "id": 1,
        "name": "Paraksh Tech",
        "contact": "09296454675",
        "contact2": null,
        "contact3": null,
        "job": null,
        "dob": null,
        "gender": "male",
        "email": "parakshtech@gmail.com",
        "sifting_type": null,
        "base_pay": null,
        "insurance": null,
        "adharcard_front": null,
        "adharcard_back": null,
        "insurance_pic": null,
        "img": null,
        "role_id": 1,
        "address": null,
        "city": null,
        "state": null,
        "pincode": null,
        "v_code": null,
        "isvarified": false,
        "isactive": false,
        "created_at": "2026-05-06T17:03:46.000Z",
        "updated_at": "2026-05-06T17:03:46.000Z"
    }])


    const getEmployeeList = async () => {
        try {
            const results = await apiClient.get("/users/all")
            setEmployeeList(results?.data?.results);
        } catch {

        }
    }

    useEffect(() => {
        getEmployeeList()
    }, [0])



    const handleClick = (emp: any) => {
        setSelectedEmployee(emp);

        // example data (replace with API)
        setSalaryData([
            { date: "2026-05-01", taken: 5000, remaining: 15000 },
            { date: "2026-05-05", taken: 3000, remaining: 12000 },
        ]);
    };

    return (
        <div className="grid grid-cols-12 gap-4">

            {/* LEFT SIDE (2 columns) */}
            <div className="col-span-2 border rounded-xl bg-white">
                <div className="px-4 py-3 border-b">
                    <h2 className="text-sm font-semibold">Employees</h2>
                </div>

                <div className="divide-y">
                    {EmployeeList.map((item: any) => (
                        <div
                            key={item.id}
                            onClick={() => handleClick(item)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100"
                        >
                            <span className="text-sm font-medium text-gray-700">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE (10 columns) */}
            <div className="col-span-10 border rounded-xl bg-white">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {selectedEmployee?.name || "Select Employee"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Total Salary: ₹ {selectedEmployee?.totalSalary || 0}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left">Date</th>
                                <th className="px-6 py-3 text-left">Taken Salary</th>
                                <th className="px-6 py-3 text-left">Remaining Salary</th>
                            </tr>
                        </thead>

                        <tbody>
                            {salaryData?.length > 0 ? (
                                salaryData.map((row: any, index: number) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-3">
                                            {new Date(row.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-red-500">
                                            ₹ {row.taken}
                                        </td>
                                        <td className="px-6 py-3 text-green-600">
                                            ₹ {row.remaining}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-6 text-gray-400">
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
