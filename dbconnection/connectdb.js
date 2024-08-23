const mongoose = require("mongoose");

// connect to DB
mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(`DB Connection Error : ${err}`));