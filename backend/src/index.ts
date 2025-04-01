import express from "express";
import bodyparser from "body-parser";
import config from "../config.json";

// Import service routers
import servicesAirline from "./kairline_services";
import servicesLender from "./klender_services";
import servicesInvest from "./kinvest_services";

const app = express();

app.use(bodyparser.json());

// Mount routes 
app.use('/api/airline', servicesAirline);
app.use('/api/lender', servicesLender);
app.use('/api/invest', servicesInvest);

// Initialize 
async function init() {
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