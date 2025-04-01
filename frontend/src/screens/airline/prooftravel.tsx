import { useEffect, useState } from "react";
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';

/**
 * `ProofTravel` is a React component that displays a list of travel-related NFTs
 * associated with the user. It fetches NFT metadata from URIs and renders them in a grid.
 *
 * It also includes a copy-to-clipboard button to share a "proof of travel" link
 * with external marketplaces or apps.
 *
 * @returns JSX for the Proof of Travel gallery
 */
export const ProofTravel = () => {
  const [loading, setLoading] = useState(false);           // Indicates if NFTs are being loaded
  const [systemMsg, setSystemMsg] = useState("");          // Stores loading or error messages
  const [data, setData] = useState<Nft[]>([]);             // List of fetched NFTs

  const [copied, setCopied] = useState(false);             // Clipboard copy state
  const textToCopy = "http://localhost:4000/airline/prooftravel/?customer=1"; // Shareable link

  // Handles click to copy link to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying text: ", error);
    }
  };

  useEffect(() => {
    // Fetch NFTs and load their metadata
    const fetchNFTs = async () => {
      setLoading(true);
      setSystemMsg("Loading...");

      try {
        // Get list of NFTs for the user
        const res = await fetch(`/api/airline/prooftravel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const { nfts } = await res.json();
        const list: Nft[] = [];

        // Fetch metadata for each NFT (from its URI)
        for (const item of nfts) {
          try {
            const res = await fetch(item.uri);
            const jsonData = await res.json();

            const newData = {
              name: jsonData.name,
              description: jsonData.description,
              image: jsonData.image,
              attributes: jsonData.attributes,
            };

            list.push(newData);
          } catch (error) {
            console.error("Error fetching NFT:", error);
          }

          setData(list); // Update state after each fetch
        }
      } catch (err: any) {
        setSystemMsg(err.stack);
      }

      setLoading(false);
    };

    // Initial fetch
    fetchNFTs();

    // Set browser tab title
    document.title = 'Proof of Travel';
  }, []);

  return (
    <div className="KAirline container">
      <h2 className="text-base/7 font-semibold text-gray-900">Travel Collection</h2>
      <p className="mt-1 text-sm/6 text-gray-600">Here is a list of your travel NFTs</p>

      {/* NFT Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((nft, index) => (
          <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{nft.name}</h2>
              <p className="text-gray-600 text-sm mb-4">{nft.description}</p>
              <div className="flex flex-col space-y-1">
                {nft.attributes.map((attr, i) => (
                  <div key={i} className="text-gray-700 text-sm">
                    <span className="font-semibold">{attr.trait_type}:</span> {attr.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Copy link section */}
      <div className="flex items-center space-x-1 p-4 bg-gray-100 rounded-lg pt-4 mt-6">
        <p className="text-gray-800 text-sm text-center">
          Share your Proof of Travel link with Perk Marketplace to unlock exclusive deals on car rentals and hotels.
        </p>
        <button
          onClick={handleCopy}
          className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          <ClipboardDocumentIcon className="h-6 w-6" />
          <span className="ml-1 text-sm">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}

// NFT interface representing travel token metadata
interface Nft {
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
}