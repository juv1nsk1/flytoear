import { useState } from "react";
import { ChevronDownIcon } from '@heroicons/react/16/solid';

/**
 * `Checkin` is a React component that renders a check-in form
 * allowing users to enter their travel details and mint a boarding pass NFT + air miles.
 *
 * On submission, it sends a POST request to `/api/airline/checkin`.
 * Displays a system message based on success or failure.
 *
 * @returns JSX for the check-in form
 */
export function Checkin() {
  // State hooks to store form data and UI feedback
  const [date, setDate] = useState("03/28/2025");
  const [destination, setDestination] = useState("New York");
  const [confirmationCode, setConfirmationCode] = useState("ABC123");
  const [loading, setLoading] = useState(false);
  const [systemMsg, setSystemMsg] = useState("");
  const [buttonProcessed, setButtonProcessed] = useState("Check-in");

  // Handles form submission and API interaction
  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setButtonProcessed("Processing...");
    setSystemMsg("Submitting...");

    try {
      // Send check-in data to backend
      const res = await fetch(`/api/airline/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationCode,
          date,
          destination,
        }),
      });

      const { error } = await res.json();

      // Handle API response
      if (!res.ok) {
        setSystemMsg(error);
      } else {
        setSystemMsg("Check-in successful! Check your wallet. Click here.");
      }
    } catch (err: any) {
      // Show error from failed fetch
      setSystemMsg(err.stack);
    }

    // Reset UI state
    setButtonProcessed("Check-in");
    setLoading(false);
  }

  return (
    <div className="KAirline container">
      <h2 className="text-base/7 font-semibold text-gray-900">Check-in</h2>
      <p className="mt-1 text-sm/6 text-gray-600">Travel to receive a NFT and Air Miles Tokens</p>

      {/* Form layout */}
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

        {/* Confirmation code input */}
        <div className="sm:col-span-3">
          <label htmlFor="confirmation-code" className="block text-sm/6 font-medium text-gray-900">
            Confirmation code
          </label>
          <div className="mt-2">
            <input
              id="confirmation-code"
              name="confirmation-code"
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>

        {/* Travel date input */}
        <div className="sm:col-span-3">
          <label htmlFor="date" className="block text-sm/6 font-medium text-gray-900">
            Travel date
          </label>
          <div className="mt-2">
            <input
              id="date"
              name="date"
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>

        {/* Destination dropdown */}
        <div className="sm:col-span-3">
          <label htmlFor="destination" className="block text-sm/6 font-medium text-gray-900">
            Destination
          </label>
          <div className="mt-2 grid grid-cols-1">
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            >
              <option>New York</option>
              <option>Rio de Janeiro</option>
              <option>Paris</option>
            </select>
            {/* Dropdown icon */}
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="sm:col-span-3 flex justify-end ">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-sky-900 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {buttonProcessed}
          </button>
        </div>
      </div>

      {/* System feedback message */}
      <div className="pt-8 pb-8 text-sm text-center text-gray-500">
        <a href="/airline/prooftravel">{systemMsg}</a>
      </div>
    </div>
  );
}