import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import Papa from "papaparse";
import { CsvData } from "./types";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const morgan = require("morgan");

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.send("OK!");
});

let db: { [key: string]: CsvData } = {};

function isCsvData(object: any): object is CsvData {
  return "id" in object && "name" in object && "email" in object;
}

app.post("/api/files", async (req: Request, res: Response) => {
  const upload = multer().single("file");
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(500).json({
          message: "There must be only one file",
        });
      }
      return res.status(500).json({
        message: "The file could not be loaded",
      });
    } else if (err) {
      return res.status(500).json({
        message: "The file could not be loaded",
      });
    }

    try {
      if (!req.file) {
        return res.status(500).json({ message: "The file 'file' is required" });
      }

      const file = req.file;
      const fileExtension = path.extname(file.originalname);
      if (fileExtension !== ".csv") {
        return res
          .status(500)
          .json({ message: "The file must be a .csv extension file" });
      }
      const fileContent = file.buffer.toString("utf8");

      let hasError = false;
      let tempDataArray: Array<{ id: string; data: CsvData }> = [];

      Papa.parse<CsvData>(fileContent, {
        header: true,
        step: async (results) => {
          const data: CsvData = results.data;
          if (!isCsvData(data)) {
            hasError = true;
            return false;
          }
          tempDataArray.push({ id: crypto.randomUUID(), data });
        },
        complete: () => {
          if (hasError) {
            return res.status(500).json({
              message:
                "The file could not be loaded, check the file structure: id, name, email",
            });
          }
          for (const item of tempDataArray) {
            db[item.id] = item.data;
          }
          return res.status(200).json({ message: "File successful loaded" });
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "The file could not be loaded",
      });
    }
  });
});

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (query === undefined) {
      return res.status(500).json({ message: "The parameter 'q' is required" });
    }

    if (Object.keys(db).length === 0) {
      return res.status(200).json({ data: {} });
    }

    const queryLower = query.toLowerCase();
    const results = Object.values(db).filter((data) =>
      Object.values(data).some((value) =>
        value.toString().toLowerCase().includes(queryLower)
      )
    );

    if (results.length === 0) {
      return res
        .status(500)
        .json({ message: `There were no results for ${query}` });
    }

    return res.status(200).json({ data: results });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unexpected error while searching for data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
