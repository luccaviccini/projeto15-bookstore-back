import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()
const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db;
try {
  await mongoClient.connect()
  db = mongoClient.db()
  console.log("Connected to database")
} catch (error) {
  console.log("Error connecting to database.", error)
}

export default db;
const app = express()
app.use(express.json())
app.use(cors())

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`rodando na porta ${port}`)
})