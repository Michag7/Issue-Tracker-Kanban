import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { API_CONFIG } from "@issue-tracker/config";
import { setupSwagger } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";
import issueRoutes from "./routes/issue.routes";
import healthRoutes from "./routes/health.routes";
import organizationRoutes from "./routes/organization.routes";
import invitationRoutes from "./routes/invitation.routes";

dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: API_CONFIG.CORS_ORIGIN,
    credentials: true, // Permitir cookies
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware para parsear cookies

// Swagger Documentation
setupSwagger(app);

// Routes
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/issues", issueRoutes);
app.use("/organizations", organizationRoutes);
app.use("/invitations", invitationRoutes);

// Error Handler
app.use(errorHandler);

const PORT = API_CONFIG.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/docs`);
});

export default app;
