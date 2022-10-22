const express = require("express");
const morgan = require("morgan");
const expressRateLimiter = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const app = express();

const globalErrorHandler = require("./controllers/error-controller");
const userRouter = require("./routes/user-routes");

const StatusCode = require("./utils/status-code");

// Body parser, reading data from request.body
// Limiting amount of data comes in the body
app.use(express.json({ limit: "5kb" }));
app.use(express.urlencoded({ extended: true, limit: "5kb" }));

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against CROSS-SITE scripting attacks
app.use(xss());

// Log every request in development mode
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Routes
app.use("/api/v1/users", userRouter);

// Handle unknown routes
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server`,
      StatusCode.NOT_FOUND
    )
  );
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
