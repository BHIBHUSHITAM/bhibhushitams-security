import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { ambassadorRouter } from "./modules/ambassadors/ambassador.routes";
import { certificateRouter } from "./modules/certificates/certificate.routes";
import { courseRouter } from "./modules/courses/course.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { eventRouter } from "./modules/events/event.routes";
import { internshipRouter } from "./modules/internships/internship.routes";
import { jobRouter } from "./modules/jobs/job.routes";
import { userRouter } from "./modules/users/user.routes";

export const app = express();

const trustProxyValue = env.trustProxy.toLowerCase();
const trustProxy =
  trustProxyValue === "true"
    ? true
    : trustProxyValue === "false"
      ? false
      : /^\d+$/.test(env.trustProxy)
        ? Number(env.trustProxy)
        : env.trustProxy;
app.set("trust proxy", trustProxy);

const allowedOrigins = env.corsOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: env.nodeEnv === "production" ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging middleware
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "bhibhushitams-auth-api" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/ambassadors", ambassadorRouter);
app.use("/api/v1/certificates", certificateRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/internships", internshipRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/protected", userRouter);

app.use(notFoundHandler);
app.use(errorHandler);
