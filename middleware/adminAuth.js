// middleware/adminAuth.js
const isLogin = (req, res, next) => {
  if (req.session.admin_id) next();
  else res.redirect("/admin");
};

const isLogout = (req, res, next) => {
  if (req.session.admin_id) res.redirect("/admin/home");
  else next();
};

module.exports = { isLogin, isLogout };  // ✅ important
