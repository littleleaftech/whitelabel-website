exports.authErrorHandler = (error) => {
  switch (error) {
    case "auth/user-not-found":
      return { message: "User not found", status: 404 };
      break;
    case "auth/wrong-password":
      return { message: "Invalid password", status: 401 };
      break;
    case "auth/argument-error":
      return {
        message: "Something went wrong when authenticating invalid JWT",
        status: 400,
        error,
      };
      break;
    case "auth/id-token-expired":
      return {
        message: "Something went wrong when authenticating expired JWT",
        status: 400,
        error,
      };
      break;
    default:
      break;
  }
};
