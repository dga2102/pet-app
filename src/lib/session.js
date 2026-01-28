export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "household_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
