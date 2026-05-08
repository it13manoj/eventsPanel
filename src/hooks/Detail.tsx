const Detail = ({
    label,
    value,
    highlight = false
}: {
    label: string;
    value: any;
    highlight?: boolean;
}) => (
    <div className="flex flex-col">
        <span className="text-gray-500 text-xs">{label}</span>
        <span className={`font-medium ${highlight ? "text-green-600" : "text-gray-800"}`}>
            {value || "-"}
        </span>
    </div>
);

export default Detail