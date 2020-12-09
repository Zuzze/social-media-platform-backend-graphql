const path = require("path");
const fs = require("fs");
const dotEnv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");

// modules
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

// image upload
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// serve images on server side
app.use("/images", express.static(path.join(__dirname, "images")));

//set headers for each request
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // This fixes 405 error
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// Authentication middleware that checks JWT token validity
app.use(auth);

// handle image upload via REST that returns path that can be saved to graphql endpoint
app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided" });
  }
  if (req.body.oldPath) {
    // remove old path and delete old image
    clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: "File stored", filePath: req.file.path });
});

// GRAPHQL
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occured";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    }
  })
);

// global error handling functionality
// in sync code trigger by throw(err)
// in async code trigger by next(err)
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(result => {
    const server = app.listen(8080);

    // Setup websockets
    const options = {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    };
    const io = require("./socket").init(server, options);
    io.on("connection", socket => {
      console.log("client connected");
    });
  })
  .catch(err => console.log(err));

const clearImage = filePath => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => console.log(err));
};
