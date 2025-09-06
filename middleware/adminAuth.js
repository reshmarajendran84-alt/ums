// middleware/adminAuth.js
const isLogin = (req, res, next) => {
  if (req.session.admin_id) {
    return next();
  }
  res.redirect("/admin/login");
};

const isLogout = (req, res, next) => {
  if (!req.session.admin_id) {
    return next();
  }
  res.redirect("/admin/dashboard");
};

module.exports = { isLogin, isLogout };
