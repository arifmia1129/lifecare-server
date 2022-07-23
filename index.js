const express = require("express");
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

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

const options = {
    auth: {
        api_key: process.env.APP_KEY
    }
}
const mailClient = nodemailer.createTransport(sgTransport(options));



async function run() {
    try {
        await client.connect();

        const doctorCollection = client.db("lifecare").collection("doctors");
        const userCollection = client.db("lifecare").collection("users");
        const appointmentCollection = client.db("lifecare").collection("appointment");

        const appointmentMail = (appointment) => {
            const {
                branch,
                department,
                length,
                consultant,
                date,
                time,
                patient,
                phone,
                address,
                email
            } = appointment;

            const emailForSend = {
                from: process.env.SOURCE_MAIL,
                to: email,
                subject: 'Your appointment has booked.',
                text: `Your appointment has booked.`,
                html: `
                <div>
                <h2>Assalamu Alaikum Dear Sir/Mam,</h2>,
                <h2>We have receive your appointment.</h2>
                <h3>Your appointment details:</h3>
                <ol>
                    <li>Branch: ${branch}</li>
                    <li>Department: ${department}</li>
                    <li>Session length: ${length} minute</li>
                    <li>Consultant: Dr ${consultant}</li>
                    <li>Date: ${date}</li>
                    <li>Time: ${time}</li>
                    <li>Patient name: ${patient}</li>
                    <li>Phone: ${phone}</li>
                    <li>Address: ${address}</li>
                </ol>
                <p>If you want confirm appointment please go to Dashboard panel and make sure payment.</p>
                <h2>Thanks for your appointment.</h2>
                <h2>Stay with us!</h2>
                <br />
                <h1>Life Care Team.</h1>
            </div>
                `
            };
            mailClient.sendMail(emailForSend, function (err, info) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(info);
                }
            });
        }

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
            appointmentMail(appointment);
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