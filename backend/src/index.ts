import express from "express";
import bodyparser from "body-parser";
import { startListener, createConfig} from "./connector";

// Import service routers
import { createServiceAirline } from "./kairline_services";
import {createServiceKLender } from "./klender_services";
import { createServiceKInvest }  from "./kinvest_services";
import { start } from "repl";

const app = express();

app.use(bodyparser.json());




// Initialize 
async function init() {
  console.log("Creating config...");
  const config = await createConfig();

  console.log("Adding routes...");

  // Mount routes 
  app.use('/api/airline', createServiceAirline(config));
  app.use('/api/lender', createServiceKLender(config));
  app.use('/api/invest', createServiceKInvest(config));

  console.log("Starting listener...");
  startListener();

  app.listen(config.PORT, () =>
    console.log(`Kaleido DApp backend listening on port ${config.PORT}!`)
);
  
}

init().catch((err) => {
  console.error(err.stack);
  process.exit(1); 
});

module.exports = {
  app,
};