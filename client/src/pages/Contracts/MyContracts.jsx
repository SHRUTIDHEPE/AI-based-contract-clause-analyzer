import { useEffect, useState } from "react";
import { getMyContracts, deleteContract } from "../../api/contracts";
import ContractCard from "../../components/ContractCard";
import { Link } from "react-router-dom";

export default function MyContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const res = await getMyContracts();
        setContracts(res.data.data.contracts);
      } catch (err) {
        setError("Failed to fetch contracts.");
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const handleDelete = async (contractId) => {
    if (window.confirm("Are you sure you want to delete this contract?")) {
      try {
        await deleteContract(contractId);
        setContracts(contracts.filter((c) => c._id !== contractId));
      } catch (err) {
        setError("Failed to delete contract.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-bold p-8">{error}</div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          My Contracts
        </h2>
        <Link
          to="/upload"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Upload New
        </Link>
      </div>

      {contracts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((c) => (
            <ContractCard key={c._id} contract={c} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">
            You haven't uploaded any contracts yet.
          </p>
        </div>
      )}
    </div>
  );
}
