import { useState } from "react";
import { Modal } from "../components/ui/modal";
import apiClient from "../hooks/api/apiClient";


export default function EmployeeModel({ isOpen, closeModal }: any) {
    if (!open) return null;

    const [EmployeeList, setEmployeeList] = useState({})








    const datahandler = (e: any) => {
        setEmployeeList(preState => ({ ...preState, [e.target.name]: e.target.value }))
    }


    const submitHandler = (e: any) => {
        e.preventDefault();

        try {
            const results = apiClient.post("/admin/Inverntory/create", EmployeeList)
            console.log(results);
            closeModal();
        } catch {

        }
    }


    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[100%] p-6 lg:p-10">
            <div className="overflow-y-auto custom-scrollbar">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        {"Employee Form"}
                    </h5>
                </div>

                {/* Form: 2-column grid */}
                <form onSubmit={submitHandler} >
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Employee's Name
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="name" onChange={datahandler} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Father's Name
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="father_name" onChange={datahandler} />
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Date Of Birth
                            </label>
                            <input type="date" className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="dob" onChange={datahandler} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Email Id
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="email" onChange={datahandler} />

                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Gender
                            </label>
                            <div className="flex items-center gap-4 mt-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        className="accent-blue-500"
                                    />
                                    Male
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        className="accent-pink-500"
                                    />
                                    Female
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="other"
                                        className="accent-gray-500"
                                    />
                                    Other
                                </label>
                            </div>

                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Marital Status
                            </label>
                            <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="single"
                          className="accent-blue-500"
                        />
                        Single
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="married"
                          className="accent-green-500"
                        />
                        Married
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="married"
                          className="accent-green-500"
                        />
                        Other
                      </label>
                    </div>

                        </div>

                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Contact No.
                            </label>
                            <input className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="contact" onChange={datahandler} />

                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Role
                            </label>

                            <select
                                name="role"
                                onChange={datahandler}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">Select Role</option>
                                <option value="manager">Manager</option>
                                <option value="employee">Employee</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="accountant">Accountant</option>
                            </select>
                        </div>
                    </div>


                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-1">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Address
                            </label>
                            <textarea className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="adress" onChange={datahandler}></textarea>
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Image
                            </label>
                            <input type="file" className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" name="image" onChange={datahandler} />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Status
                            </label>

                            <select
                                name="status"
                                onChange={datahandler}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">Select Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>



                    <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                        <button
                            onClick={closeModal}
                            type="button"
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            Close
                        </button>
                        <button

                            type="submit"
                            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                            {"Submit"}
                        </button>
                    </div>
                </form>
            </div>


        </Modal>
    );
}