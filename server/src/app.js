import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();



const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000"]; // default for local dev

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g., mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow all localhost origins for dev convenience
      if (origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies & authorization headers
  })
);

// common middleware
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))

app.use(cookieParser());

// // import routes
import healthCheckRouter from "./routes/healthCheck.routes.js"
import userRouter from "./routes/user.routes.js"
import contractRouter from "./routes/contract.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js";
import notificationRouter from "./routes/notification.routes.js";
import auditLogRouter from "./routes/auditlog.routes.js";




// // routes
app.use("/api/v1/healthcheck",healthCheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/contracts", contractRouter)
app.use("/api/v1/notifications", notificationRouter)
app.use("/api/v1/auditlogs", auditLogRouter)

app.use(errorHandler)

export {app}