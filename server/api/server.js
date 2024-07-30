const { Turnkey } = require("@turnkey/sdk-server");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5858;
const fs = require("fs");
require("dotenv").config();

const API_BASE_URL = process.env.API_BASE_URL;
const API_PRIVATE_KEY = process.env.API_PRIVATE_KEY;
const API_PUBLIC_KEY = process.env.API_PUBLIC_KEY;
const DEFAULT_ORGANIZATION_ID = process.env.DEFAULT_ORGANIZATION_ID;

const { addUser, findUserByEmail, verifyUserEmail } = require("../database");

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(express.json());

const turnkeyConfig = {
  apiBaseUrl: API_BASE_URL,
  apiPrivateKey: API_PRIVATE_KEY,
  apiPublicKey: API_PUBLIC_KEY,
  defaultOrganizationId: DEFAULT_ORGANIZATION_ID,
};

const turnkeyServerClient = new Turnkey(turnkeyConfig);

const turnkeyProxyHandler = turnkeyServerClient.expressProxyHandler({
  allowedMethods: [
    "oauth",
    "createSubOrganization",
    "emailAuth",
    "initUserEmailRecovery",
    "initImportWallet",
    "initImportPrivateKey",
    "getSubOrgIds",
  ],
});

app.get("/", (req, res) =>
  res.send("Welcome to Turnkey's Demo Embedded Wallet API!"),
);

app.post("/", turnkeyProxyHandler);

app.post("/add-user", async (req, res) => {
  try {
    const addUserResponse = await addUser(
      req.body.email,
      req.body.subOrganizationId,
      0,
    );
    res.status(200).send({ user: addUserResponse });
  } catch (error) {
    res.status(500).send({ error: `Failed to add user: ${error}` });
  }
});

app.post("/find-user-by-email", async (req, res) => {
  if (!req.body.email) {
    res.status(400).send({ error: "No email address provided." });
  }

  try {
    const user = await findUserByEmail(req.body.email);
    res.status(200).send({ user: user });
  } catch (error) {
    res
      .status(400)
      .send({ error: `User with email ${req.body.email} not found: ${error}` });
  }
});

app.post("/verify-user-email", async (req, res) => {
  try {
    const verifyUserResponse = await verifyUserEmail(req.body.email);
    res.status(200).send({ user: verifyUserResponse });
  } catch (error) {
    res.status(400).send({
      error: `Unable to verify user email ${req.body.email}: ${error}`,
    });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
