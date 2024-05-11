if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/expressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const User = require("./models/user.js");

const DB_URL = process.env.ATLASDB_URL;

// to connect database
main = async () => {
  // await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
  await mongoose.connect(DB_URL);
};
main()
  .then((res) => console.log("Connection Successfull"))
  .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// store session data
const sessionStore = MongoStore.create({
  mongoUrl: DB_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

sessionStore.on("error", () => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

// cookies sessions
const sessionOptions = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// passport auth. middlewares
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// locals middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info");
  res.locals.currentUser = req.user;
  next();
});

// redirect to main page
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// url redirect routes middleware
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// next all error to middleware
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found !!"));
});
// return error status and message
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Somthing Went Wrong !!" } = err;
  res.render("error.ejs", { statusCode, message });
});

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
