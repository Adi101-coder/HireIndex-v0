import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";

// Simple logging function to avoid vite import in production
const log = (message: string, source = "express") => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      log(`${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Initialize routes and start server
(async () => {
  try {
    await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("Error:", err);
    });

    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
      const distPath = path.resolve(__dirname, "..", "dist");
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      } else {
        app.get("*", (req, res) => {
          res.json({ 
            message: "Backend API is running", 
            endpoints: ["/api/resume/analyze"],
            note: "Frontend not built yet"
          });
        });
      }
    } else {
      // Development mode - import vite only when needed
      try {
        const { setupVite } = await import("./vite");
        const server = createServer(app);
        await setupVite(app, server);
      } catch (error) {
        console.warn("Vite not available for development:", error);
      }
    }

    // Start server
    const port = process.env.PORT || 5000;
    const server = createServer(app);
    
    server.listen(port, () => {
      log(`Server running on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

export default app;
