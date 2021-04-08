import express from "express";
import multer from "multer";
import fs from "fs-extra";
import csv from "csv";

// Setup express
const app = express();

const port = process.env.PORT || 3000;

app.use(express.static("public"));

// Setup storage - allows us to customize the way that multer stores the files
const storage = multer.diskStorage({
  // Set destination where files should be stored
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    // Set filename on file in the uploads folder
    const { originalname } = file;
    cb(null, Date.now() + "-" + originalname);
  },
  // make sure only specific files can be uploaded
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "text/comma-separated-values" || file.mimetype !== "text/plain" || file.mimetype !== "text/tab-separated-values") {
      // reject file
      cb(new Error("Forbidden file type"));
    } else {
      // accept file
      cb(null, true);
    }
  },
});

// Setup multer
const upload = multer({ storage });

// Setup upload route
app.post("/upload", upload.single("report"), (req, res) => {
  if (req.file) {
    // Get report file or throw ex on error
    try {
      // load file
      const raw = fs.readFile(`uploads/${req.file.filename}`);
      //
      // need something to store data for later use here ...

      // Delete upload after being used
      //   fs.unlinkSync(`uploads/${req.file.filename}`);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        ok: false,
        error: "Something went wrong. Please check format",
      });
    }
    res.status(200).send({
      ok: true,
      message: "File uploaded",
    });
  } else {
    res.status(400).send({
      ok: false,
      error: "Please upload a file",
    });
  }
});

// Start server
app.listen(port, () => console.log("App is listening..."));
