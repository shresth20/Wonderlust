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

// test data listing
// app.get("/test", async (req, res) => {
//   let sampleListings = new Listing ({
//     title: "New villa",
//     description:
//       "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
//     image: {
//       filename: "listingimage",
//       url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
//     },
//     price: 1500,
//     location: "Malibu",
//     country: "United States",
//   })
//   await sampleListings.save()
//   console.log("saved")
//   res.send("Data saved");
// });

// // check token for authenticate
// app.use("/admin", (req, res, next) => {
//   let { token } = req.query;
//   if (token == "54321") {
//     console.log("Right token key");
//     next();
//   }
//   // throw new Error(403, "ACCESS DENIDED !!");
//   res.send("ACCESS DENIDED !!");
// });

// app.get("/admin", (req, res) => {
//   res.send("This is Admin page");
// });

// app.use(cookieParser());
// // store cookies
// app.get("/cookie", async (req, res) => {
//   console.dir(req.cookies);
//   res.send("cookies save ho gya");
// });

// app.get("/demo", async (req, res) => {
//   let user = new User({
//     email: "student@gmail.com",
//     username: "student",
//   });
//   let reg = await User.register(user, "mypass");
//   res.send(reg);
// });
