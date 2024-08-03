const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const mongoSanitaze = require("express-mongo-sanitize");
const helmet = require("helmet");
const fileUpload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const connectDb = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// connect to DB
connectDb();

// Route files
const authRoute = require("./routes/authRoute");
const industryRoute = require("./routes/industryRoute");
const companyRoute = require("./routes/companyRoute");
const invitationRoute = require("./routes/inviteRoute");
const usersRoute = require("./routes/userRoute");
const jobSiteRoute = require("./routes/jobSiteRoute");
const departmentRoute = require("./routes/departmentRoute");
const timesheetRoute = require("./routes/timeSheetRoute");
const companyJobRoute = require("./routes/companyJobRoute");

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileUpload());

// Sanitize data
app.use(mongoSanitaze);

// Set Security headers
app.use(helmet());

// Prevent XSS attacs
app.use(xss());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// routers
const versionOne = (routeName) => `/api/v1/${routeName}`;

app.use(versionOne("auth"), authRoute);
app.use(versionOne("industry"), industryRoute);
app.use(versionOne("company"), companyRoute);
app.use(versionOne("invite"), invitationRoute);
app.use(versionOne("users"), usersRoute);
app.use(versionOne("jobsite"), jobSiteRoute);
app.use(versionOne("department"), departmentRoute);
app.use(versionOne("timesheet"), timesheetRoute);
app.use(versionOne("job"), companyJobRoute);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(400).json({ success: false });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exist process
  server.close(() => process.exit(1));
});
