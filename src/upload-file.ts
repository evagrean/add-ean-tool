import express from "express";
import multer from "multer";
import { v4 as uuid4 } from "uuid";

// allows us to customize the way that multe stores the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, originalname);
  },
});
const upload = multer({ storage });

const app = express();

app.use(express.static("public"));

app.post("/upload", upload.single("report"), (req, res) => {
  return res.json({ status: "OK" });
});

app.listen(3000, () => console.log("App is listening..."));
