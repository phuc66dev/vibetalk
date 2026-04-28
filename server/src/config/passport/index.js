const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require("../../models/user.model");
/* Passport Middleware */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Client secret
      callbackURL: `http://localhost:${process.env.PORT || 8000}/api/auth/google/callback`,
    },
    async function (token, tokenSecret, profile, done) {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              avatar: profile.picture,
              email: profile.emails[0].value,
              googleId: profile.id,
            });
          }
        }
        done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID, // Client ID
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // Client secret
      callbackURL: `http://localhost:${process.env.PORT || 8000}/api/auth/github/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

          if (email) {
            user = await User.findOne({ email });
          }

          if (user) {
            user.githubId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName || profile.username,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
              email: email || `${profile.username}@github.com`,
              githubId: profile.id,
            });
          }
        }
        done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* How to store the user information in the session */
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

/* How to retrieve the user from the session */
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

/* Exporting Passport Configuration */
module.exports = passport;
