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