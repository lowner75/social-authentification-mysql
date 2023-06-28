/**
* middleware/passport.local.js ...
* Social Authentication Passport JS Local Strategy ...
*/

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require("../config/database")
const argon2 = require("argon2");

// Passport local strategy ...
passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password", failureRedirect: "/login/", successRedirect: "/profile/", passReqToCallback: true },
  (req, username, password, done) => {
    db.query("select * from user where email = ? ", [username],
      async (err, user) => {
        if (err) console.log(err)
        if (!user) {
          return done("Email address and password combination not found.", false);
        } else {
          try {
            if (user[0].user_active === 0) {
              return done("Account locked or disabled. Please contact support.", user);
            } else {
              const passwordVerified = await argon2.verify(user[0].password, password);
              if (passwordVerified === true) {
                //console.log("Password verified.") // For debugging ...
                db.query("update user set provider = 'Local'")
                return done(null, user)
              } else {
                return done("Email address and password combination not found.", user);
              }
            }
          } catch (err) {
            console.log(err)
            return done("Error.", user);
          }
        }
      }
    )
  }
))

// Serialize user ...
passport.serializeUser((user, done) => {
	done(null, user.id)
})

// Deserialize user ...
passport.deserializeUser((id, done) => {
	db.query("select * from user where id = ?", [id], (err, user) => {
		done(null, user)
  })
})