const express = require("express");
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();


app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ctfzx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const doctorCollection = client.db("lifecare").collection("doctors");

        app.get("/doctors", async (req, res) => {
            const query = {};
            const doctors = await doctorCollection.find(query).toArray();
            res.send(doctors);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Welcome to Life Care Server!");
})

app.listen(port, () => {
    console.log(`Life Care server is running on port ${port}`);
})