const { firebaseConfig } = require("../config/firebase-config");
const admin = require("firebase-admin");
admin.initializeApp();

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
    switch (error.code) {
      case "auth/user-not-found":
        return res.status(404).json({ error: "User not found" });
        break;
      case "auth/wrong-password":
        return res.status(401).json({ error: "Invalid password" });
        break;

      default:
    }
  }
};
