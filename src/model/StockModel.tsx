type Props = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function StockModel({ open, setOpen }: Props) {
    if (!open) return null;
    return (
        <div className="p-5">



            {/* Modal */}
            {open && (
              
                    <div className="min-h-screen rounded-2xl fixed inset-1 flex items-center flex justify-end bg-black/[0.03] xl:px-10 xl:py-2" style={{marginRight:"4rem"}}>

                        <div className="w-[80%] rounded-lg bg-white p-6 shadow-lg">

                            <h2 className="text-lg font-semibold">Modal Title</h2>

                            <p className="mt-2 text-gray-600">
                                This is a popup modal in React.
                            </p>

                            <div className="mt-4 flex justify-end gap-2">

                                <button
                                    onClick={() => setOpen(false)}
                                    className="rounded bg-gray-400 px-4 py-2 text-white"
                                >
                                    Cancel
                                </button>

                                <button
                                    className="rounded bg-brand-500 px-4 py-2 text-white"
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    </div>
               
            )}

        </div>
    );
}