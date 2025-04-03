import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * `Unstake` is a React component that allows users to withdraw (unstake) their investment.
 * It fetches the current stake position on load, and if there's no active position,
 * the user is redirected to the stake page.
 *
 * Upon confirmation, it sends a POST request to `/api/invest/unstake` to withdraw the funds,
 * and redirects the user back to the stake screen.
 *
 * @returns JSX rendering the unstake interface
 */
export function Unstake() {
  const navigate = useNavigate();

  const [principal, setPrincipal] = useState("0");     // Invested amount
  const [startdate, setStartDate] = useState("");      // Date when staking started
  const [interest, setInterest] = useState("0");       // Accumulated interest

  // Load current stake info from backend
  const fetchLoan = async () => {
    const res = await fetch('/api/invest/position', { method: 'GET' });

    if (!res.ok) {
      const { error } = await res.json();
      console.error('Error fetching balance:', error);
      return;
    }

    const { accumulatedInterest, principal, startTimestamp } = await res.json();

    // If there is no active stake, redirect to stake page
    if (principal === "0.00") {
      navigate("/invest/stake");
    }

    setPrincipal(principal);
    setInterest(accumulatedInterest);
    setStartDate(startTimestamp);
  };

  // Load data on mount
  useEffect(() => {
    fetchLoan();
  }, []);

  // Handle withdrawal request
  const handleRepay = async () => {
    const res = await fetch('/api/invest/unstake', { method: 'POST' });

    if (!res.ok) {
      const { error } = await res.json();
      console.error('Error repaying:', error);
      return;
    }

    alert("Repayment confirmed!");

    // Redirect immediately after confirmation
    navigate("/invest/stake");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Withdwraw</h1>

      {/* Display stake information */}
      <div className="mb-2 text-sm font-bold">
        Principal: <span className="font-medium">{principal}</span>
      </div>
      <div className="mb-2 text-sm">
        Interest: <span className="font-medium">{interest}</span>
      </div>
      <div className="mb-2 text-sm">
        Start Date: <span className="font-medium">{startdate}</span>
      </div>

      {/* Confirm unstake action */}
      <button
        onClick={handleRepay}
        className="w-full bg-sky-900 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Confirm withdraw
      </button>
    </div>
  );
}