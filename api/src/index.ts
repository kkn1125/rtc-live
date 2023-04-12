import dotenv from "dotenv";
import path from "path";

import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import fs from "fs";
import cors from "cors";

const MODE = process.env.NODE_ENV;

dotenv.config({
  path: path.join(path.resolve(), ".env"),
});
dotenv.config({
  path: path.join(path.resolve(), `.env.${MODE}`),
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(path.resolve(), "tmp"),
  })
);
app.use(cors());

const makeDirnameFilename = (name: string, chunk: number) => {
  const dirname = `/app/uploads/${name}`;
  const filename = `${dirname}/${chunk}.webm`;
  return [dirname, filename];
};

app.put("/api/upload", (req, res) => {
  const file = (req.files as fileUpload.FileArray)
    .file as fileUpload.UploadedFile;
  const [dirname, filename] = makeDirnameFilename(
    req.body.name,
    req.body.chunk
  );

  // console.log("test good", req.files);
  // res.status(200).send({ ok: true, message: "ok" });

  fs.promises
    .mkdir(path.join(path.resolve(), "tmp", dirname), { recursive: true })
    .then(() => file.mv(path.join(path.resolve(), "tmp", filename)));

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Upload\n");
});

app.get("/api/download", (req, res) => {
  const query = req.query;
  const [dirname, filename] = makeDirnameFilename(
    query.name as string,
    Number(query.chunk)
  );
  console.log(path.join(path.resolve(), "tmp", filename));
  fs.promises
    .readFile(path.join(path.resolve(), "tmp", filename))
    .then((file) => {
      res.statusCode = 200;
      res.setHeader("Content-Transfer-Encoding", "binary");
      res.setHeader("Content-Type", "application/octet-stream");
      res.write(file, "binary");
      res.end();
    })
    .catch(() => {
      res.statusCode = 204;
      res.end();
    });
});

const HOST = process.env.HOST || "localhost";
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, HOST, () => {
  console.log("listening on port", PORT);
});
