const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const godownRouter = require("./routers/godown");
const itemRouter = require("./routers/items");
const cors = require("cors");

const app = express();
app.use(cors());
const helmet = require("helmet");
app.use(helmet());

const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use("/godown", godownRouter);
app.use("/item", itemRouter);

app.listen(port, () => {
  console.log("Server set up on port", port);
});
