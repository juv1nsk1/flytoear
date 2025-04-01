import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * `Borrow` is a React component that allows users to borrow USDT
 * using their FLYM token balance as collateral.
 *
 * It fetches the user's balances, simulates borrowing capacity,
 * shows interest and repayment information, and sends a request to initiate a loan.
 *
 * @returns JSX rendering the borrow interface
 */
export function Borrow() {
  const [flymBalance, setFlymBalance] = useState("0");     // User's FLYM token balance (collateral)
  const [usdtBalance, setUsdtBalance] = useState("0");     // User's current USDT balance
  const [maxBorrow, setMaxBorrow] = useState("0");         // Max amount the user can borrow
  const [interest, setInterest] = useState("0");           // Calculated interest on loan
  const [repaymentDate, setRepaymentDate] = useState("");  // When repayment is due
  const [borrowAmount, setBorrowAmount] = useState("0");   // Amount user wants to borrow

  const gracePeriodDays = 90;                              // Simulated loan term

  const navigate = useNavigate();

  // Fetch balances and simulate loan capacity
  const fetchBalance = async () => {
    const res = await fetch('/api/lender/balance', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const { error } = await res.json();
      console.error('Error fetching balance:', error);
      return;
    }

    const { flymbalance, usdtbalance } = await res.json();
    setFlymBalance(flymbalance);
    setUsdtBalance(usdtbalance);

    // Simulate loan parameters based on FLYM amount
    const resp = await fetch('/api/lender/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: flymbalance }),
    });

    if (!resp.ok) {
      const { error } = await resp.json();
      console.error('Error fetching simulate:', error);
      return;
    }

    const { interest, maxBorrow } = await resp.json();
    setMaxBorrow(maxBorrow);
    setInterest(interest);
    setBorrowAmount("1"); // Default value
  };

  // Run on component mount
  useEffect(() => {
    fetchBalance();

    // Calculate repayment date based on grace period
    const now = new Date();
    now.setDate(now.getDate() + gracePeriodDays);
    const due = now.toLocaleDateString();
    setRepaymentDate(due);
  }, []);

  // Handle input change for loan amount
  const handleChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setBorrowAmount(value);

    // Recalculate interest and repayment date
    const interestValue = (parseFloat(value) * 0.05).toFixed(2); // 5% interest
    const now = new Date();
    now.setDate(now.getDate() + gracePeriodDays);
    const due = now.toLocaleDateString();

    setInterest(interestValue);
    setRepaymentDate(due);
  };

  // Confirm the loan
  const handleBorrow = async () => {
    const res = await fetch('/api/lender/borrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: borrowAmount }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      console.error('Error borrowing:', error);
      return;
    }

    alert("Loan confirmed!");

    // Redirect after confirmation
    setTimeout(() => {
      navigate("/lend/repay");
    }, 5000);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Borrow USDT</h1>

      {/* Info cards */}
      <div className="mb-2 text-sm">Your available FLYM: <span className="font-medium">{flymBalance}</span></div>
      <div className="mb-2 text-sm">Your USDT balance: <span className="font-medium">{usdtBalance}</span></div>
      <div className="mb-2 text-sm">Maximum you can borrow: <span className="font-medium">{maxBorrow} USDT</span></div>
      <div className="mb-2 text-sm">Repayment due: <span className="font-medium">{repaymentDate}</span></div>
      <div className="mb-4 text-sm">Interest: <span className="font-medium">{interest} USDT</span></div>

      {/* Input field */}
      <div className="mb-4 text-sm">
        Amount to borrow:
        <input
          type="number"
          value={borrowAmount}
          onChange={handleChange}
          className="mb-4 border rounded px-2 py-1 w-full mt-1"
          placeholder="Enter amount to borrow"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleBorrow}
        className="w-full bg-sky-900 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Confirm Loan
      </button>
    </div>
  );
}