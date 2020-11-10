const functions = require("firebase-functions");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const { adminLogin } = require("./controllers/auth-endpoint");

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/admin", adminLogin);

app.use((req, res) => {
  res.send({ error: "Path not found" });
});

exports.api = functions.region("europe-west2").https.onRequest(app);
