// // const getUploadedData = (uploadFileName) => {
// //   const uploadedData = [];
// //       fs.createReadStream(`uploads/${uploadFileName}`)
// //         .pipe(csv({ separator: "\t" }))
// //         .on("data", (data) => uploadedData.push(data))
// //         .on("end", () => {
// //           console.log("Upload data end");
// //         });

// //         return uploadedData
// //   }

// import express from "express";
// import multer from "multer";
// import fs from "fs-extra";
// import csv from "csv-parser";

// const referenceFile = "GUS.QUER_ARTIKEL_INFO.csv";

// // Setup express
// const app = express();

// const port = process.env.PORT || 3000;

// app.use(express.static("public"));

// // Setup storage - allows us to customize the way that multer stores the files
// const storage = multer.diskStorage({
//   // Set destination where files should be stored
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     // Set filename on file in the uploads folder
//     const { originalname } = file;
//     cb(null, Date.now() + "-" + originalname);
//   },
// });

// // Setup multer
// const upload = multer({ storage });

// // Setup upload route and run all the logic on post
// app.post("/upload", upload.single("report"), (req, res) => {
//   const uploadFileName = req.file.filename;

//   if (req.file) {
//     const referenceData = getReferenceData();
//     console.log(referenceData[0]);
//     // Delete upload after being used
//     //   fs.unlinkSync(`uploads/${req.file.filename}`);
//   } else {
//     res.status(400).send({
//       ok: false,
//       error: "Something went wrong. Please upload a file",
//     });
//   }
// });

// const parseReferenceData = (referenceFile) => {
//   let referenceData = [];
//   return new Promise((resolve, reject) => {
//     fs.createReadStream(referenceFile)
//       .on("error", (error) => reject(error))
//       .pipe(csv({}))
//       .on("data", (data) => referenceData.push(data))
//       .on("end", () => resolve(referenceData));
//   });
// };

// const getReferenceData = () => {
//   try {
//     const referenceData = parseReferenceData(referenceFile);
//     return referenceData;
//   } catch (error) {
//     console.error("testGetReferenceData: an error occured", error.message);
//   }
// };

// const parseUploadedData = (uploadedFileName) => {
//   let uploadedData = [];
//   let uploadFilePath = `uploads/${uploadedFileName}`;
//   return new Promise((resolve, reject) => {
//     fs.createReadStream(uploadFilePath)
//       .on("error", (error) => reject(error))
//       .pipe(csv({ separator: "\t" }))
//       .on("data", (data) => uploadedData.push(data))
//       .on("end", () => resolve(uploadedData));
//   });
// };

// const getUploadedData = async (uploadedFileName) => {
//   try {
//     const uploadedData = await parseUploadedData(uploadedFileName);
//     console.log();
//   } catch (error) {}
// };

// // parse csv reference file

// // Start server
// app.listen(port, () => console.log("App is listening..."));
