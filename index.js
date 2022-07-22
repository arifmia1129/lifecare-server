const express = require("express");
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();


app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ctfzx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req, res, next) => {
    const reqAuth = req?.headers?.authorization;
    if (!reqAuth) {
        return res.status(401).send({ message: "Unauthorized Access!" });
    }
    const token = reqAuth.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access!" });
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
        await client.connect();

        const doctorCollection = client.db("lifecare").collection("doctors");
        const userCollection = client.db("lifecare").collection("userr");
        const appointmentCollection = client.db("lifecare").collection("appointment");

        app.get("/doctors", async (req, res) => {
            const query = {};
            const doctors = await doctorCollection.find(query).toArray();
            res.send(doctors);
        })

        app.put("/users", async (req, res) => {
            const email = req.query.email;
            const filter = { email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    email
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            const token = jwt.sign({ email }, process.env.SECRET_KEY, {
                expiresIn: '1h'
            })
            res.send({ result, token });
        })

        app.post("/appointment", async (req, res) => {
            const appointment = req.body;
            const result = await appointmentCollection.insertOne(appointment);
            res.send(result);
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