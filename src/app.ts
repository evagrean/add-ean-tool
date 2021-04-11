import express from "express";
import multer from "multer";
import fs from "fs-extra";
import csv from "csvtojson";

let referenceData;
let uploadedData: any[];

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
});

// Setup multer
const upload = multer({ storage });

// Setup upload route and run all the logic on post
app.post("/upload", upload.single("report"), (req, res, next) => {
  if (req.file) {
    console.log("uploaded " + req.file.filename);
    return next();
    // Delete upload after being used
    //   fs.unlinkSync(`uploads/${req.file.filename}`);
  } else {
    res.status(400).send({
      ok: false,
      error: "Something went wrong. Please upload a file",
    });
  }
});

app.post("/upload", async (req, res, next) => {
  const uploadedFilePath = `uploads/${req.file.filename}`;
  const jsonArray = await csv({ delimiter: "auto" }).fromFile(uploadedFilePath);
  uploadedData = jsonArray;
  //console.log(uploadedData);
  return next();
});

app.post("/upload", async (req, res, next) => {
  const referenceFilePath = "referenceData.csv";
  const jsonArray = await csv({ delimiter: "auto" }).fromFile(referenceFilePath);
  referenceData = jsonArray;

  // referenceData = jsonArray;
  return next();
});

app.post("/upload", (req, res) => {
  compareUploadedAndRefernceData(referenceData, uploadedData);
  //fs.unlinkSync(`uploads/${req.file.filename}`);
  return res.json({ status: "ok" });
});

const compareUploadedAndRefernceData = (referenceData, uploadedData) => {
  let referenceArticleNumber;
  let uploadedSKU;
  // die zwei ARtikel-Nummern müssen vorher noch gesplittet werden
  uploadedData.map((dataEntry) => {
    const sku = dataEntry.sku;
    referenceData.find((referenceEntry) => (referenceEntry.ARTIKEL_NUMMER.includes(sku) ? (dataEntry.EAN = referenceEntry.BARCODE) : null));
  });
  console.log(uploadedData);
};

// Start server
app.listen(port, () => console.log("App is listening..."));

// Artikelnummern in referenceData aufsplitten
// EAN an andere Stelle?
// uploadedData zurück in CSV und zum Download anbieten
