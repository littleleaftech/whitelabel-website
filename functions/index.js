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
const {
  addContent,
  updateContent,
  getContent,
  deleteContent,
} = require("./controllers/content-body-endpoint.js");
const {
  addImages,
  getAllImages,
  deleteImage,
} = require("./controllers/images-endpoint");
const {
  addFooterContent,
  updateFooterContent,
  getFooterContent,
  deleteFooterContent,
} = require("./controllers/footer-endpoint");

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

/** Auth endpoints */
app.post("/admin", adminLogin);
app.post("/set-admin", isAdmin, setAdmin);
app.post("/remove-admin", isAdmin, removeAdmin);

/** Content endpoints */
app.post("/content/body/:page/:section", isAdmin, addContent);
app.put("/content/body/:page/:section", isAdmin, updateContent);
app.get("/content", getContent);
app.delete("/content/:page/:section", isAdmin, deleteContent);

/** Image endpoints */
app.post("/images/:page/:type", isAdmin, addImages);
app.get("/images", getAllImages);
app.delete("/images/:name", isAdmin, deleteImage);

/** Footer endpoints */
app.post("/footer/:area", isAdmin, addFooterContent);
app.put("/footer/:area", isAdmin, updateFooterContent);
app.get("/footer", getFooterContent);
app.delete("/footer/:area", isAdmin, deleteFooterContent);

app.use((req, res) => {
  res.send({ error: "Path not found" });
});

exports.api = functions.region("europe-west2").https.onRequest(app);
