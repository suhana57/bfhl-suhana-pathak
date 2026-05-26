const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "DeskFlow API is running" });
});

app.use("/tickets", require("./routes/tickets"));

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(process.env.PORT || 5000, () => console.log("running"));
});