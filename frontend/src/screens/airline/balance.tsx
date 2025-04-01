import React, { useState, useEffect } from 'react';

/**
 * `MileBalance` is a React component that displays the user's airline mile balance.
 *
 * It fetches the balance and last update timestamp from the `/api/airline/balance` endpoint
 * on initial render using `useEffect`, and displays the result in a styled card.
 *
 * @returns JSX element showing mile balance and last update info
 */
export const MileBalance = () => {
  const [balance, setBalance] = useState(0); // Holds the user's mile balance
  const [updated, setUpdated] = useState(""); // Holds the last updated timestamp

  useEffect(() => {
    // Fetches the mile balance from the backend API
    const fetchBalance = async () => {
      const res = await fetch('/api/airline/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle fetch failure
      if (!res.ok) {
        const { error } = await res.json();
        console.error('Error fetching balance:', error);
        return;
      }

      // Extract balance and updated date from response
      const { balance, updated } = await res.json();
      setUpdated(updated);
      setBalance(balance);
    };

    fetchBalance();
  }, []); // Runs only once on component mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow rounded-lg p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Fly to Ear - Your Balance is:</h1>

        {balance !== null ? (
          <p className="text-xl text-gray-700 block mb-4">
            You have <span className="font-bold">{balance}</span> miles. <br />
            <span className="text-sm text-gray-500">Last updated: {updated}</span>
          </p>
        ) : (
          <p className="text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
};