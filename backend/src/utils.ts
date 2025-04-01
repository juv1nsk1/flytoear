import { TravelRequestBody, TravelDataResponse } from "./types";
import { travel, image, special } from "../database.json";
import config from "../config.json";

/**
 * Generates NFT metadata URI and identifies the customer based on travel information.
 * Searches for a matching travel reservation, related destination image,
 * and optionally a special promotional image for the travel month.
 *
 * @param req - TravelRequestBody containing confirmationCode, destination, and date
 * @returns TravelDataResponse with NFT URI, customer address, and optional error
 */
export function getTravelData(req: TravelRequestBody): TravelDataResponse {
  // Find matching reservation based on code and destination
  const filtered = travel.filter(
    (item) => item.code === req.confirmationCode && item.destination === req.destination
  );

  if (filtered.length === 0) {
    return { uri: "", customer: "", error: "No travel found" };
  }

  // Get image based on destination
  const imageFiltered = image.filter((item) => item.destination === req.destination);

  // Get promotional image if destination and month/year match a special entry
  const monthYear = req.date.split("/")[0] + "/" + req.date.split("/")[2];
  const specialFiltered = special.filter(
    (item) => item.destination === req.destination && item.date === monthYear
  );

  // Use special image if available; otherwise, fallback to destination image
  const imageUrl = specialFiltered.length > 0 ? specialFiltered[0].url : imageFiltered[0].url;

  // Construct NFT metadata URI with encoded query params
  const uri =
    `${config.NFT_BASE_URI}?destination=` +
    req.destination.replace(/ /g, "%20") +
    "&date=" +
    req.date.replace(/\//g, "-") +
    "&image=" +
    imageUrl;

  // Return result with resolved URI and mapped customer wallet address
  return {
    uri: uri,
    customer: config.customer[filtered[0].customer],
    error: null,
  };
}

/**
 * Converts a raw token value (as string) into a human-readable decimal string.
 *
 * @param value - The token value as a string (e.g. in wei)
 * @param decimal - Number of decimals used by the token (default: 18)
 * @returns The formatted token value as a decimal string (e.g. "1.23")
 */
export function convertValue(value: string, decimal = 18): string {
  const raw = BigInt(value);
  const factor = BigInt("1" + "0".repeat(decimal));

  const whole = raw / factor;
  const fraction = (raw % factor).toString().padStart(decimal, "0").slice(0, 2);

  return `${whole.toString()}.${fraction}`;
}

/**
 * Converts a decimal string (e.g. "1.23") into an integer string used for on-chain interactions.
 *
 * @param value - Decimal token value as a string
 * @param decimal - Number of decimals to apply (default: 18)
 * @returns Integer string representation (e.g. for FireFly or smart contracts)
 */
export function convertValueToIntStr(value: string, decimal = 18): string {
  const [whole, fraction = ""] = value.split(".");

  // Pad fraction to match required decimal places
  const normalized = whole + fraction.padEnd(decimal, "0");

  // Limit length to decimal precision
  const finalStr = normalized.slice(0, whole.length + decimal);

  return BigInt(finalStr).toString();
}

/**
 * Converts an ISO date string (possibly with nanoseconds) into a formatted readable timestamp.
 *
 * @param dateString - ISO date string (e.g. from token metadata)
 * @returns Localized, readable date and time string
 */
export function convertDate(dateString: string): string {
  // Trim extra nanoseconds if present
  const trimmedIso = dateString.replace(/\.(\d{3})\d+Z$/, ".$1Z");
  const dateObj = new Date(trimmedIso);

  // Format date to human-readable format
  const formattedDate = dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return formattedDate;
}