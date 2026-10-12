require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");
const { updateCustomerStatus } = require("./controllers/customerController");
const initDatabase = require("./db/init");

const app = express();
const localOrigins = ["http://localhost:3000", "http://localhost:3001"];
const configuredOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = [...new Set([...localOrigins, ...configuredOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin is not allowed"));
    },
  }),
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Set request timeout to 10 minutes for large file uploads
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000);
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);

app.put(
  "/api/users/:userId/status",
  authMiddleware,
  adminMiddleware,
  updateCustomerStatus,
);
app.patch(
  "/api/users/:userId/status",
  authMiddleware,
  adminMiddleware,
  updateCustomerStatus,
);

app.use((error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "One of the images is too large. Max size is 20MB per file.",
    });
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      message: "Too many images selected. Maximum is 8 images.",
    });
  }

  if (error.code === "LIMIT_FIELD_VALUE") {
    return res.status(400).json({
      message: "Image payload is too large. Please choose smaller images.",
    });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      message: "Invalid image upload field. Please try selecting files again.",
    });
  }

  return res.status(500).json({ message: error.message || "Server error" });
});

const startServer = async () => {
  try {
    console.log("🚀 Starting server...");
    const port = Number(process.env.PORT || 5000);

    if (process.env.INIT_DATABASE === "false") {
      console.log("🗄️  Database initialization skipped (INIT_DATABASE=false)");
    } else {
      console.log("🗄️  Initializing database connection...");
      await initDatabase();
    }

    app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`📝 Ready to accept requests on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

startServer();
