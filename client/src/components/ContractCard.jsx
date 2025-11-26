import { Link } from "react-router-dom";
import { FaFileAlt, FaTrash, FaEye } from "react-icons/fa";

export default function ContractCard({ contract, onDelete }) {
  const statusColors = {
    uploaded: "text-blue-500",
    analyzing: "text-yellow-500",
    completed: "text-green-500",
    failed: "text-red-500",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <FaFileAlt className="text-2xl text-indigo-500" />
            <h3 className="font-bold text-gray-800 text-lg ml-3">
              {contract.fileName}
            </h3>
          </div>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              statusColors[contract.status] || "text-gray-500"
            }`}
          >
            {contract.status}
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Uploaded: {new Date(contract.uploadedAt).toLocaleString()}
        </p>
      </div>

      <div className="bg-gray-50 px-5 py-3 flex justify-end items-center space-x-3">
        <Link
          to={`/contracts/${contract._id}`}
          className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
          title="View Details"
        >
          <FaEye className="text-lg" />
        </Link>
        <button
          onClick={() => onDelete(contract._id)}
          className="text-red-500 hover:text-red-700 transition-colors duration-300"
          title="Delete Contract"
        >
          <FaTrash className="text-lg" />
        </button>
      </div>
    </div>
  );
}
