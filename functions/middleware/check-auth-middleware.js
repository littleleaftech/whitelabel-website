const admin = require("firebase-admin");
const { authErrorHandler } = require("../utils/auth-error-handler");

exports.isAdmin = async (req, res, next) => {
  let idToken;

  if (!req.headers.authorization) {
    res.status(403).json({ message: "Not authorized" });
  }

  idToken = req.headers.authorization.split("Bearer ")[1];
  try {
    const getClaims = await admin.auth().verifyIdToken(idToken);
    if (getClaims.admin === true) {
      return next();
    }
  } catch (error) {
    const errorMessage = authErrorHandler(error.code);
    const { status, message } = errorMessage;

    res.status(status).json({ error: message });
  }
};
