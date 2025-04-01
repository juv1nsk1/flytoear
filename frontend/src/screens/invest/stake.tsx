import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * `Stake` is a React component that allows the user to invest USDT tokens
 * by staking them in return for interest. It fetches the user's balance,
 * displays the interest rate, and sends a stake request upon confirmation.
 *
 * After staking, the user is redirected to the unstake page.
 *
 * @returns JSX for the staking interface
 */
export function Stake() {
  const [usdtBalance, setUsdtBalance] = useState("0");      // User's USDT balance
  const [interestRate, setInterestRate] = useState("0");    // Current interest rate
  const [investAmount, setInvestAmount] = useState("0");    // Amount to invest

  const navigate = useNavigate(); // React Router hook for redirecting

  // Fetch balance and interest rate from backend
  const fetchBalance = async () => {
    // Get USDT balance
    const res = await fetch('/api/invest/balance', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const { error } = await res.json();
      console.error('Error fetching balance:', error);
      return;
    }

    const { usdtbalance } = await res.json();
    setUsdtBalance(usdtbalance);
    setInvestAmount("1"); // Pre-fill with max amount

    // Get interest rate
    const resp = await fetch('/api/invest/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!resp.ok) {
      const { error } = await resp.json();
      console.error('Error fetching simulate:', error);
      return;
    }

    const { interestRate } = await resp.json();
    setInterestRate(interestRate);
  };

  // Run fetchBalance on component mount
  useEffect(() => {
    fetchBalance();
  }, []);

  // Handle input change for amount
  const handleChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setInvestAmount(value);
  };

  // Submit investment (stake request)
  const handleBorrow = async () => {
    const res = await fetch('/api/invest/stake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: investAmount }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      console.error('Error staking:', error);
      return;
    }

    alert("Investment confirmed!");

    // Optional wait for backend/state to settle
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Redirect to unstake view
    navigate("/invest/unstake");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Invest USDT</h1>

      {/* Balance and interest info */}
      <div className="mb-2 text-sm">
        Your available USDT: <span className="font-medium">{usdtBalance}</span>
      </div>
      <div className="mb-4 text-sm">
        Interest Rate: <span className="font-medium">{interestRate}%</span>
      </div>

      {/* Input for investment amount */}
      <div className="mb-4 text-sm">
        Amount to invest:
        <input
          type="number"
          value={investAmount}
          onChange={handleChange}
          className="mb-4 border rounded px-2 py-1 w-full mt-1"
          placeholder="Enter amount to stake"
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleBorrow}
        className="w-full bg-sky-900 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Confirm Investment
      </button>
    </div>
  );
}