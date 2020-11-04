const functions = require("firebase-functions");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const { adminLogin } = require("./controllers/user");

const app = express(); // creates express app

app.use(cors({ origin: true }));
app.use(bodyParser.json()); // parse json object bodies
app.use(bodyParser.urlencoded()); // parse bodies passed from a url ie form

app.post("/admin", adminLogin);

// onRequest takes a https function
// app will turn into multiple different routes
exports.api = functions.region("europe-west2").https.onRequest(app);
