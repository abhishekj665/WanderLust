const User = require("../models/user");
const {saveRedirectUrl} = require("../middleware");

module.exports.renderSignUp = (req, res) => {
  res.render("users/signup.ejs");
}


module.exports.sigup = async(req, res) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser,(err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust");
            res.redirect("/listings");

        });
        
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLogIn = (req, res) => {
  res.render("users/login.ejs");
}

module.exports.login = async(req, res) => {
    req.flash("success", "Welcome back to WanderLust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
  req.logOut((err) => {
    if (err) {
      req.flash("error", "Something went wrong!");
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
}

