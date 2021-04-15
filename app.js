import express from "express";
import multer from "multer";
import fs from "fs-extra";
import csvtojson from "csvtojson";
import jsonConverter from "json-2-csv";

let referenceData;
let uploadedData;
let originalFilename;
let fileName;
let filePath;

// Setup express
const app = express();

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
  // remove old download-files if existing
  fs.emptyDirSync("downloads");
  fs.emptyDirSync("uploads");

  if (req.file) {
    console.log("uploaded " + req.file.filename);
    next();
  } else {
    res.status(400).send({
      ok: false,
      error: "Something went wrong. Please upload a file",
    });
  }
});

app.post("/upload", async (req, res, next) => {
  const uploadedFilePath = `uploads/${req.file.filename}`;
  const referenceFilePath = "referenceData.csv";
  uploadedData = await convertCSVToJSON(uploadedFilePath);
  referenceData = await convertCSVToJSON(referenceFilePath);

  //split ARTIKEL_NUMMER if string contains two article numbers
  for (let referenceEntry of referenceData) {
    referenceEntry.ARTIKEL_NUMMER = referenceEntry.ARTIKEL_NUMMER.split(", ");
  }

  next();
});

// app.post("/upload", async (req, res, next) => {
//   const referenceFilePath = "referenceData.csv";
//   referenceData = await convertCSVToJSON(referenceFilePath);

//   //split ARTIKEL_NUMMER if string contains two article numbers
//   for (let referenceEntry of referenceData) {
//     referenceEntry.ARTIKEL_NUMMER = referenceEntry.ARTIKEL_NUMMER.split(", ");
//   }

//   next();
// });

app.post("/upload", (req, res, next) => {
  originalFilename = req.file.originalname;
  fileName = `EAN-${originalFilename}`;
  filePath = `./downloads/${fileName}`;
  const jsonWithEAN = addRelatedEANToUploadedData(referenceData, uploadedData);

  convertJSONAndGenerateCSVFile(jsonWithEAN, filePath);

  // if (req.file) {
  //   fs.unlinkSync(`./uploads/${req.file.filename}`);
  // }

  res.send(`<form action="/download" method="get">
  <button>Download file with EAN</button>
</form>`);
});

app.get("/download", (req, res, next) => {
  res.download(filePath);
});

const convertCSVToJSON = async (filePath) => {
  try {
    const jsonArray = await csvtojson({ delimiter: "auto" }).fromFile(filePath);
    return jsonArray;
  } catch (error) {
    console.error(error);
  }
};

const addRelatedEANToUploadedData = (referenceData, uploadedData) => {
  const uploadedDataToModify = uploadedData;
  // die zwei ARtikel-Nummern müssen vorher noch gesplittet werden
  uploadedDataToModify.map((dataEntry) => {
    const sku = dataEntry.sku;
    referenceData.find((referenceEntry) => (referenceEntry.ARTIKEL_NUMMER.includes(sku) ? ((dataEntry.EAN = referenceEntry.BARCODE), (dataEntry.skuFromReference = referenceEntry.ARTIKEL_NUMMER)) : null));
  });
  const validJSONDataWithEAN = uploadedDataToModify;
  return validJSONDataWithEAN;
};

const convertJSONAndGenerateCSVFile = async (jsonWithEAN, filePath) => {
  jsonConverter.json2csv(jsonWithEAN, (err, csvWithEAN) => {
    if (err) {
      throw err;
    }
    fs.writeFile(filePath, csvWithEAN, (err) => {
      if (err) {
        throw err;
      }
    });
  });
};

// Start server
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server is running on port " + this.address().port);
});
