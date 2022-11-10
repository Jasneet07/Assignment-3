const User = require("../models/schemas/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

module.exports.register = function (req, res, next) {
  res.render("register");
};

module.exports.handleRegister = function (req, res, next) {
  const { email, password, cpassword } = req.body;

  let errors = [];

  if (!email || !password || !cpassword)
    errors.push({ msg: "Please fill all the fields!!" });

  if (password !== cpassword) errors.push({ msg: "Password does not match" });

  if (password.length < 6)
    errors.push({ msg: "Password length should be atleast 6 characters" });

  if (errors.length) {
    res.render("register", {
      errors,
      email,
      password,
      cpassword,
    });
  } else {
    //Validation passed

    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User exist
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          errors,
          email,
          password,
          cpassword,
        });
      } else {
        const newUser = new User({
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            newUser.password = hash;
            // Save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can login"
                );
                res.redirect("/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
};

module.exports.login = function (req, res, next) {
  res.render("login");
};

module.exports.handleLogin = (req, res, next) => {

  passport.authenticate("local", {
    successRedirect: "/employer/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};

module.exports.logout = (req,res,next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
        req.flash('success_redirect', 'You are logout!!');
        res.redirect('/login');
  });
}