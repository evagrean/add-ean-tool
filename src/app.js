import express from "express";
import multer from "multer";
import fs from "fs-extra";
import csvtojson from "csvtojson";
import jsonConverter from "json-2-csv";

let referenceData;
let uploadedData;

// Setup express
const app = express();

const port = process.env.PORT || 3000;

app.use(express.static("public"));

// const testJSON = [
//   { "amazon-order-id": "303-5975916-1796362", "merchant-order-id": "", "shipment-id": "D1L8Ktg9T", "shipment-item-id": "DpC8SpLxR", "amazon-order-item-id": "19172154183715", "merchant-order-item-id": "", "purchase-date": "2021-04-05T10:18:58+00:00", "payments-date": "2021-04-07T02:02:29+00:00", "shipment-date": "2021-04-07T02:02:35+00:00", "reporting-date": "2021-04-07T03:02:41+00:00", "buyer-email": "stb6ssjkf7gpxz4@marketplace.amazon.de", "buyer-name": "", "buyer-phone-number": "", sku: "H14", "product-name": "Gusti Handtasche Damen Leder - Therese Ledertasche mit Reißverschluss Umhängetasche Schultertasche Shopper groß Braun Echtleder", "quantity-shipped": "1", currency: "EUR", "item-price": "61.30", "item-tax": "11.65", "shipping-price": "0.84", "shipping-tax": "0.16", "gift-wrap-price": "0.00", "gift-wrap-tax": "0.00", "ship-service-level": "Standard", "recipient-name": "", "ship-address-1": "", "ship-address-2": "", "ship-address-3": "", "ship-city": "Höxter", "ship-state": "Deutschland,Nordrhein-Westfalen", "ship-postal-code": "37671", "ship-country": "DE", "ship-phone-number": "", "bill-address-1": "", "bill-address-2": "", "bill-address-3": "", "bill-city": "", "bill-state": "", "bill-postal-code": "", "bill-country": "", "item-promotion-discount": "0.00", "ship-promotion-discount": "-0.84", carrier: "AMZN_DE", "tracking-number": "AA0065939877", "estimated-arrival-date": "2021-04-09T18:00:00+00:00", "fulfillment-center-id": "KTW1", "fulfillment-channel": "AFN", "sales-channel": "Amazon.de", EAN: "4250888189359" },
//   { "amazon-order-id": "302-3365684-6185967", "merchant-order-id": "", "shipment-id": "D6gPSnLDx", "shipment-item-id": "D8C6SWLxR", "amazon-order-item-id": "47702717416675", "merchant-order-item-id": "", "purchase-date": "2021-04-06T06:27:45+00:00", "payments-date": "2021-04-07T02:02:33+00:00", "shipment-date": "2021-04-07T02:02:33+00:00", "reporting-date": "2021-04-07T05:02:40+00:00", "buyer-email": "1mtykh1v123sv6l@marketplace.amazon.de", "buyer-name": "", "buyer-phone-number": "", sku: "2G114-26-13-105", "product-name": "Gusti Damen Gürtel Leder - Lane Gürtel Damen Herren Gürtel Echtleder Braun Breite 4 cm 105cm Umfang mit Schnalle", "quantity-shipped": "1", currency: "EUR", "item-price": "14.24", "item-tax": "2.71", "shipping-price": "3.35", "shipping-tax": "0.64", "gift-wrap-price": "0.00", "gift-wrap-tax": "0.00", "ship-service-level": "Standard", "recipient-name": "", "ship-address-1": "", "ship-address-2": "", "ship-address-3": "", "ship-city": "Dortmund", "ship-state": "Nordrhein westfalen", "ship-postal-code": "44359", "ship-country": "DE", "ship-phone-number": "", "bill-address-1": "", "bill-address-2": "", "bill-address-3": "", "bill-city": "", "bill-state": "", "bill-postal-code": "", "bill-country": "", "item-promotion-discount": "0.00", "ship-promotion-discount": "0.00", carrier: "AMZN_DE", "tracking-number": "AA0065924739", "estimated-arrival-date": "2021-04-09T18:00:00+00:00", "fulfillment-center-id": "KTW1", "fulfillment-channel": "AFN", "sales-channel": "Amazon.de", EAN: "4250888161133" },
// ];

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
  } else {
    res.status(400).send({
      ok: false,
      error: "Something went wrong. Please upload a file",
    });
  }
});

app.post("/upload", async (req, res, next) => {
  const uploadedFilePath = `uploads/${req.file.filename}`;
  const jsonArray = await csvtojson({ delimiter: "auto" }).fromFile(uploadedFilePath);
  uploadedData = jsonArray;
  //console.log(uploadedData);
  next();
});

app.post("/upload", async (req, res, next) => {
  const referenceFilePath = "referenceData.csv";
  const jsonArray = await csvtojson({ delimiter: "auto" }).fromFile(referenceFilePath);
  referenceData = jsonArray;

  // referenceData = jsonArray;
  next();
});

app.post("/upload", (req, res, next) => {
  const originalFilename = req.file.originalname;
  const fileName = `EAN-${originalFilename}`;
  const filePath = `public/downloads/${fileName}`;
  const jsonWithEAN = addRelatedEANToUploadedData(referenceData, uploadedData);
  //console.log(jsonWithEAN);
  // only for testing download in advance - to be deleted afterwards
  fs.writeFile("output.json", JSON.stringify(jsonWithEAN), (err) => {
    if (err) {
      throw err;
    }
  });
  convertJSONAndGenerateCSVFile(jsonWithEAN, filePath);

  next();
});

app.post("/upload", (req, res) => {
  const originalFilename = req.file.originalname;
  const fileName = `EAN-${originalFilename}`;
  const filePath = `public/downloads/${fileName}`;
  if (req.file) {
    fs.unlinkSync(`uploads/${req.file.filename}`);
  }
  //   res.send(`<form action="/upload" method="get">
  //   <input type="submit" value="Download file" />
  // </form>`);
  res.download(filePath);
});

const addRelatedEANToUploadedData = (referenceData, uploadedData) => {
  const uploadedDataToModify = uploadedData;
  // die zwei ARtikel-Nummern müssen vorher noch gesplittet werden
  uploadedDataToModify.map((dataEntry) => {
    const sku = dataEntry.sku;
    referenceData.find((referenceEntry) => (referenceEntry.ARTIKEL_NUMMER.includes(sku) ? (dataEntry.EAN = referenceEntry.BARCODE) : null));
  });
  const validJSONDataWithEAN = uploadedDataToModify;
  //const validJSONDataWithEAN = JSON.stringify(uploadedDataToModify);
  return validJSONDataWithEAN;
};

const convertJSONAndGenerateCSVFile = (jsonWithEAN, filePath) => {
  jsonConverter.json2csv(jsonWithEAN, (err, csvWithEAN) => {
    if (err) {
      throw err;
    }
    fs.writeFile(filePath, csvWithEAN, (err) => {
      if (err) {
        throw err;
      }
    });
    console.log(csvWithEAN);
  });
};

// Start server
app.listen(port, () => console.log("App is listening..."));
