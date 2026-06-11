
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import AdmZip from "adm-zip";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Extend JSON limit for high-res image base64
  app.use(express.json({ limit: '20mb' }));

  // API Routes
  app.get("/api/download-source", (req, res) => {
    try {
      const zip = new AdmZip();
      const projectRoot = process.cwd();
      
      // Include selected root files
      const filesToInclude = [
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "server.ts",
        "index.html",
        "metadata.json",
        ".env.example"
      ];

      filesToInclude.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
          zip.addLocalFile(filePath);
        }
      });

      // Include entire src directory
      const srcPath = path.join(projectRoot, "src");
      if (fs.existsSync(srcPath)) {
        zip.addLocalFolder(srcPath, "src");
      }

      const zipBuffer = zip.toBuffer();
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', 'attachment; filename=ForensicGuard_Source.zip');
      res.send(zipBuffer);
    } catch (error) {
      console.error("Source Download Error:", error);
      res.status(500).send("Failed to generate source zip");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Forensic Server running on http://localhost:${PORT}`);
  });
}

startServer();
