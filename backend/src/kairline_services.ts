import { Router, Request, Response } from "express";
import { convertDate, getTravelData, convertValue } from "./utils";
import { TravelRequestBody } from "./types";
import { getTokenBalance, mintToken, mintTokenByApi, expireToken, getPoolsID } from "./connector";

export const createServiceAirline = (config:any) => {
  // Router for airline services
  const servicesAirline = Router();

  // Mint an NFT (boarding pass) and miles for a traveler
  servicesAirline.post("/checkin", async (req: Request, res: Response) => {
    try {

      const { uri, customer, error } = getTravelData(req.body as TravelRequestBody);

      if (error) {
        return res.status(500).json({ error });
      }

      // Mint the boarding pass NFT via contract API
      const statusPass = await mintTokenByApi(config.TOKEN_FLYP_API, customer, uri);

      // Mint loyalty miles (FLYM tokens)
      const statusMiles = await mintToken("FLYM", customer, "10000000000000000000000");

      // Check if both operations succeeded
      const status = statusMiles && statusPass ? 200 : 500;

      return res.status(status).json({});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Get NFTs owned by the test customer
  servicesAirline.post("/prooftravel", async (req: Request, res: Response) => {


    const result = await getTokenBalance(config.TOKEN_FLYP_POOL_ID, config.CUSTOMER);
    return res.status(200).json({ nfts: result });
  });

  // Get FLYM balance and last update timestamp for the test customer
  servicesAirline.get("/balance", async (req: Request, res: Response) => {
    const balancelist = await getTokenBalance(config.TOKEN_FLYM_POOL_ID, config.CUSTOMER);

    const formattedDate = convertDate(balancelist[0]?.updated);
    return res.status(200).json({
      balance: convertValue(balancelist[0]?.balance),
      updated: formattedDate,
    });
  });

  // Get all FLYM token balances across all users
  servicesAirline.get("/balances", async (req: Request, res: Response) => {
    const balancelist = await getTokenBalance(config.TOKEN_FLYM_POOL_ID, "all");
    return res.status(200).json({ balancelist: balancelist });
  });

  // Generate NFT metadata dynamically based on query params
  servicesAirline.get("/nft", async (req: Request, res: Response) => {
    const { destination, date, image } = req.query;

    res.send({
      name: `Flight to ${destination}`,
      description: `Check-in on ${date} for your flight to ${destination}.`,
      image: image || `${config.NFT_IMAGE_URL}${(destination as string).toLowerCase()}.png`,
      attributes: [
        { trait_type: "Date", value: date },
        { trait_type: "Destination", value: destination },
      ],
    });
  });

  // Burn (expire) a specified amount of FLYM tokens from a user
  servicesAirline.post("/expire", async (req: Request, res: Response) => {
    const { key, amount } = req.body;

    await expireToken(config.TOKEN_FLYM_POOL_ID, key, amount);

    return res.status(200).json({ status: "success" });
  });


  return servicesAirline;
};

