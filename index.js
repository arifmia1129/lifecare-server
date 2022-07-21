const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();


app.use(cors());
app.use(express.json());

const port = process.PORT || 5000;


const uri = `mongodb+srv://${process.DB_USER}:${process.DB_PASS}@cluster0.ctfzx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});



app.get("/", (req, res) => {
    res.send("Welcome to Life Care Server!");
})

app.listen(port, () => {
    console.log(`Life Care server is running on port ${port}`);
})