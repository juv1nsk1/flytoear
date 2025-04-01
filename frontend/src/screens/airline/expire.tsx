import React, { useState, useEffect } from 'react';

/**
 * `Expire` is a React component that displays a list of customers with their mile balances,
 * allows entering a reduction amount, and sends an "expire" command to the backend.
 *
 * It interacts with:
 * - `GET /api/airline/balances` to fetch all customer balances
 * - `POST /api/airline/expire` to burn (expire) a specific amount of miles from a customer
 *
 * @returns JSX rendering a table with controls to expire miles
 */
export const Expire = () => {
  // Mocked fallback list (not used directly, but helpful in dev)
  const initialClients = [
    { id: 1, name: "Client 1", balance: 10000 },
    { id: 2, name: "Client 2", balance: 5000 },
    { id: 3, name: "Client 3", balance: 7500 },
  ];

  // Customer list loaded from backend
  const [customers, setCustomers] = useState<Customer[]>([]);

  // UI feedback
  const [message, setMessage] = useState("");

  // Shared input value for reduction (currently applied to all rows)
  const [reduceValue, setReduceValue] = useState(0);

  // Handles input field updates
  const handleInputChange = (key: string, value: number) => {
    setReduceValue(value);
  };

  // Sends the expire request to the backend
  const handleExpire = async (key: string) => {
    if (reduceValue <= 0) {
      setMessage("Please enter a valid reduction value.");
      return;
    }

    setMessage("Sending...");
    const res = await fetch('/api/airline/expire', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: key,
        amount: reduceValue,
      }),
    });

    // Reset after sending
    setReduceValue(0);
    setMessage("Command sent. The balance will be updated in a few minutes.");
  };

  // Loads balances from backend
  const fetchBalance = async () => {
    const res = await fetch('/api/airline/balances', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const { error } = await res.json();
      console.error('Error fetching balance:', error);
      return;
    }

    const list = await res.json();
    setCustomers(list.balancelist);
  };

  // Fetch balances on component mount
  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Expire Miles</h1>

      {/* Table displaying customer balances and input for expiring miles */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Client</th>
              <th className="px-4 py-2 border-b">Balance</th>
              <th className="px-4 py-2 border-b">Reduction Value</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.key} className="text-center">
                <td className="px-4 py-2 border-b">{customer.key}</td>
                <td className="px-4 py-2 border-b">{customer.balance}</td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="number"
                    value={reduceValue}
                    onChange={(e) =>
                      handleInputChange(customer.key, parseInt(e.target.value))
                    }
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Enter reduction"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleExpire(customer.key)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Expire
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feedback message */}
      <div className="flex items-center space-x-1 p-4 bg-gray-100 rounded-lg pt-4 mt-6">
        <p className="text-gray-800 text-sm text-center">{message}</p>
      </div>
    </div>
  );
};

// Customer type based on balance API response
interface Customer {
  pool: string;
  connector: string;
  namespace: string;
  key: string;
  balance: string;
  updated: string;
}

// Optional helper interface (not used directly here)
interface Balance {
  key: string;
  amount: number;
}