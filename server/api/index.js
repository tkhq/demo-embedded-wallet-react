const { Turnkey } = require("@turnkey/sdk-server");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5858;
const fs = require("fs");
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL;
const API_PRIVATE_KEY = process.env.API_PRIVATE_KEY;
const API_PUBLIC_KEY = process.env.API_PUBLIC_KEY;
const DEFAULT_ORGANIZATION_ID = process.env.DEFAULT_ORGANIZATION_ID;

const { addUser, findUserByEmail, verifyUserEmail } = require('../database');

const corsOptions = {
  origin: '*'
};

app.use(cors(corsOptions));
app.use(express.json());

const turnkeyConfig = {
  apiBaseUrl: API_BASE_URL,
  apiPrivateKey: API_PRIVATE_KEY,
  apiPublicKey: API_PUBLIC_KEY,
  defaultOrganizationId: DEFAULT_ORGANIZATION_ID
}

const turnkeyServerClient = new Turnkey(turnkeyConfig);

const turnkeyProxyHandler = turnkeyServerClient.expressProxyHandler({
  allowedMethods: [
    "oauth",
    "createSubOrganization",
    "emailAuth",
    "initUserEmailRecovery",
    "initImportWallet",
    "initImportPrivateKey",
    "getSubOrgIds"
  ]
});

app.get("/", (req, res) => res.send('Express on Vercel'));

app.post("/", turnkeyProxyHandler);

app.post("/add-user", async (req, res) => {
  const addUserResponse = await addUser(req.body.email, req.body.subOrganizationId, 0);
  res.status(200).send({ user: addUserResponse });
});

app.post("/find-user-by-email", async (req, res) => {
  const user = await findUserByEmail(req.body.email);
  res.status(200).send({ user: user });
});

app.post("/verify-user-email", async (req, res) => {
  const verifyUserResponse = await verifyUserEmail(req.body.email);
  res.status(200).send({ user: verifyUserResponse });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
