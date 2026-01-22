import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure the temp folder exists
const tempPath = path.join(__dirname, "../public/temp/");
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
}

// Simple filename sanitizer
const sanitize = (str) => str.replace(/[^a-zA-Z0-9]/g, "_");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempPath),
  filename: (req, file, cb) => {
    const name = sanitize(path.parse(file.originalname).name);
    const ext = path.extname(file.originalname);
    const filename = `${name}_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

export default storage;
