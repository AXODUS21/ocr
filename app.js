const express = require("express");
const app = express();
const fs = require("fs"); // used to read and create files
const multer = require("multer"); // used for uploading files
const Tesseract = require("tesseract.js");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }).single("avatar");

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return console.log("Error", err);
    }

    // Corrected to read file with a callback
    fs.readFile(`./uploads/${req.file.originalname}`, (readErr, data) => {
      if (readErr) {
        return console.log("Error reading file", readErr);
      }

      // Start OCR process with Tesseract
      Tesseract.recognize(data, "eng", { tessjs_create_pdf: "1" })
        .then(({ data: { text } }) => {
          res.send(text); // Send extracted text as response
        })
        .catch((err) => {
          console.error("OCR Error:", err);
          res.status(500).send("Error processing image.");
        })
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
