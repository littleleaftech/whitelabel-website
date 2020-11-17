const functions = require("firebase-functions");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const {
  adminLogin,
  setAdmin,
  removeAdmin,
} = require("./controllers/auth-endpoint");
const { isAdmin } = require("./middleware/check-auth-middleware");

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/admin", adminLogin);
app.post("/set-admin", isAdmin, setAdmin);
app.post("/remove-admin", isAdmin, removeAdmin);

app.use((req, res) => {
  res.send({ error: "Path not found" });
});

exports.api = functions.region("europe-west2").https.onRequest(app);
