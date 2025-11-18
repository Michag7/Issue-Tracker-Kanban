export const API_CONFIG = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRES_IN: "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};

export const DATABASE_CONFIG = {
  URL:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/issuetracker",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
