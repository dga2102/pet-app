import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import Household from "../models/households.js";
import HouseholdMember from "../models/householdMembers.js";
import dbConnect from "./db.js";

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    await dbConnect();
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy (username/password)
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await dbConnect();

        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with this email
        user = await User.findOne({
          email: profile.emails[0].value.toLowerCase(),
        });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new household for new user
        const household = await Household.create({
          name: `${profile.displayName}'s Household`,
          createdBy: null, // Will be updated after user creation
        });

        // Create new user
        user = await User.create({
          email: profile.emails[0].value.toLowerCase(),
          name: profile.displayName,
          googleId: profile.id,
          householdId: household._id,
        });

        // Update household createdBy
        household.createdBy = user._id;
        await household.save();

        // Add user as owner of household
        await HouseholdMember.create({
          householdId: household._id,
          userId: user._id,
          role: "owner",
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export default passport;
