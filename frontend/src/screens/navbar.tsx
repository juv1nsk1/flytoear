import Logo from '../assets/logo.png';
export function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">


        <div className="flex-shrink-0">
          <img className="h-8 w-8" src={Logo} alt="Logo" />
        </div>

        <div className="flex items-center space-x-8">

          <div className="relative group">
            <button className="text-white px-3 py-2 font-medium focus:outline-none">
              K Airline
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <a
                href="/airline/checkin"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Check-in
              </a>
              <a
                href="/airline/prooftravel"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Proof of Travel
              </a>
              <a
                href="/airline/balance"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Miles Balance
              </a>
              <a
                href="/airline/expire"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Expire Miles
              </a>
            </div>
          </div>

          <div className="relative group">
            <button className="text-white px-3 py-2 font-medium focus:outline-none">
              K Bank
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">

              <a
                href="/lend/repay"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Lend
              </a>
              <a
                href="/invest/unstake"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Invest
              </a>

            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

