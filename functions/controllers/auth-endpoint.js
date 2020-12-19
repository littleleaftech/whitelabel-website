const {
  authErrorHandler,
} = require("../utils/errorHandlers/auth-error-handler");
const { firebaseConfig } = require("../config/firebase-config");
const { admin } = require("../config/admin-config");

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  let token;

  try {
    const userRef = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);

    const userToken = await userRef.user.getIdToken();
    token = userToken;
    res.send({ token });
  } catch (error) {
    const errorMessage = authErrorHandler(error.code);
    const { status, message } = errorMessage;

    res.status(status).json({ error: message });
  }
};

exports.setAdmin = async (req, res) => {
  const { email } = req.body;
  try {
    const userRef = await admin.auth().getUserByEmail(email);
    if (
      userRef.customClaims !== undefined &&
      Object.keys(userRef.customClaims).length > 0
    ) {
      res.json({ message: `${userRef.email} is already admin` });
    } else {
      await admin.auth().setCustomUserClaims(userRef.uid, { admin: true });
      res.send({ message: "User is now an admin" });
    }
  } catch (error) {
    const errorMessage = authErrorHandler(error.code);
    const { status, message } = errorMessage;

    res.status(status).json({ error: message });
  }
};

exports.removeAdmin = async (req, res) => {
  const { email } = req.body;

  try {
    const userRef = await admin.auth().getUserByEmail(email);
    if (userRef.customClaims === undefined) {
      res.send({ message: "User is not set as admin" });
    } else {
      if (userRef["customClaims"]) {
        await admin.auth().setCustomUserClaims(userRef.uid, null);
        res.send({ message: "Admin has been removed from this user" });
      }
    }
  } catch (error) {
    const errorMessage = authErrorHandler(error.code);
    const { status, message } = errorMessage;

    res.status(status).json({ error: message });
  }
};
