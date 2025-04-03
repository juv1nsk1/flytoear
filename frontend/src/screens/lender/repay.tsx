import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * `Repay` is a React component that allows users to repay an active loan.
 * It fetches current loan details (principal, interest, collateral, and start date),
 * and if no loan is found, it redirects the user to the borrow page.
 *
 * Upon repayment, it sends a POST request to `/api/lender/repay`
 * and then redirects the user back to the borrow screen.
 *
 * @returns JSX rendering the loan repayment interface
 */
export function Repay() {
  const navigate = useNavigate();

  // Loan data
  const [principal, setPrincipal] = useState("0");
  const [isapproved, setApproved] = useState(false);
  const [collateral, setCollateral] = useState("0");
  const [startdate, setStartDate] = useState("");
  const [interest, setInterest] = useState("0");

  // Fetch loan info on load
  const fetchLoan = async () => {
    const res = await fetch('/api/lender/loan', { method: 'GET' });

    if (!res.ok) {
      const { error } = await res.json();
      console.error('Error fetching loan:', error);
      return;
    }

    const { collateralAmount, interestAmount, principal, startTimestamp, isApproved } = await res.json();

    // If there's no active loan, redirect to borrow screen
    if (principal === "0.00") {
      navigate("/lend/borrow");
    }

    setPrincipal(principal);
    setCollateral(collateralAmount);
    setInterest(interestAmount);
    setStartDate(startTimestamp);
    setApproved(isApproved);
  };

  useEffect(() => {
    fetchLoan();
  }, []);

  // Send repayment request
  const handleRepay = async () => {
    const res = await fetch('/api/lender/repay', { method: 'POST' });

    if (!res.ok) {
      const { error } = await res.json();
      console.error('Error repaying:', error);
      return;
    }

    alert("Repayment confirmed!");
    navigate("/lend/borrow");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Repay</h1>

      {/* Loan summary */}
      <div className="mb-2 text-sm font-bold">
        Principal: <span className="font-medium">{principal}</span>
      </div>
      <div className="mb-2 text-sm">
        Interest: <span className="font-medium">{interest}</span>
      </div>
      <div className="mb-2 text-sm font-thin">
        Collateral (FLYM): <span className="font-medium">{collateral}</span>
      </div>
      <div className="mb-4 text-sm">
        Date: <span className="font-medium">{startdate}</span>
      </div>

      {/* Repay action */}
      <button
        disabled={!isapproved}
        onClick={handleRepay}
        className="w-full bg-sky-900 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        { isapproved ? "Confirm Repayment": "Loan pending approval" }
      </button>
    </div>
  );
}