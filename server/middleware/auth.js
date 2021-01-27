const { User } = require("../models/User");

let auth = (req, res, next) => {
  let token = req.cookies.w_auth;

  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true,
      });

    req.token = token;
    //여기 모든 유저 정보가 담겨있다.
    req.user = user;
    next();
  });
};

module.exports = { auth };
