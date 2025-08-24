const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            next(); // user logged in -> continue
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home'); // already logged in -> send to home
        } else {
            next(); // not logged in -> continue
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout
};
