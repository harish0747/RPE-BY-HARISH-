
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import AdmZip from "adm-zip";
import { GoogleGenAI } from "@google/genai";

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

  app.post("/api/analyze-image", async (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    try {
      // Initialize properly as per gemini-api skill
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const mimeType = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)?.[1] || "image/jpeg";
      const base64Data = imageBase64.split(',')[1];
      
      const prompt = `Act as an expert digital forensics analyst. Analyze this image and determine if it is likely AI-generated. 
      Return a machine-readable JSON object matching this structure:
      {
        "classification": "AI-generated" | "Real" | "Edited" | "Deepfake" | "Hybrid" | "Uncertain",
        "aiProbabilityScore": number (0-100),
        "confidenceLevel": "Low" | "Medium" | "High" | "Very High",
        "finalForensicSummary": string (reason, forensic evidence)
      }
      Do not put the JSON in markdown code blocks, return only the JSON string.`;

      let response: any;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: {
              parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: prompt }
              ]
            },
          });
          break;
        } catch (error: any) {
          retries--;
          console.error(`Analysis attempt failed (Attempt ${3 - retries}/3):`, error.message || error);
          if (retries === 0) throw error;
          // Exponential backoff
          const delay = (Math.pow(2, 3 - retries) * 2000) + (Math.random() * 1000);
          console.log(`Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      if (!response) {
        throw new Error("Failed to get analysis after retries");
      }

      const resultText = response.text?.trim() || "{}";
      const resultObj = JSON.parse(resultText.replace(/```json/g, "").replace(/```/g, ""));
      
      res.json(resultObj);
    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
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
