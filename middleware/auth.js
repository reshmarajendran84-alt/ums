const isLogin = (req, res, next) => {
  if (req.session.user_id) {
    next();
  } else {
    res.redirect("/");
  }
};

const isLogout = (req, res, next) => {
  if (req.session.user_id) {
    res.redirect("/home");
  } else {
    next();
  }
};

module.exports = { isLogin, isLogout };
