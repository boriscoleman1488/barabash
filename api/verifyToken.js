const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Bearer <token>
    // console.log(token);

    await jwt.verify(
      token,
      process.env.SECRET_KEY_FOR_CRYPTOJS,
      (err, user) => {
        if (err) {
          // console.log(err);
          return res.status(403).json("Token is not valid!");
        }
        req.user = user;
        next();
      }
    );
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

module.exports = verifyToken;
