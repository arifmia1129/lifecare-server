const express = require("express");
const cors = require('cors')
const app = express();


app.use(cors());
app.use(express.json());

const port = process.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Welcome to Life Care Server!");
})

app.listen(port, () => {
    console.log(`Life Care server is running on port ${port}`);
})