import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import joi from "joi"

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

const signUpSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  confirmPassword: joi.ref('password')
})

const signInSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required()
})

app.post('/sign-up', async(req,res)=>{
  const {name, email, password, confirmPassword} = req.body
  try {
    const user = await db.collection('users').findOne({email})

    if(user) return res.sendStatus(409)
    const SALT = 10
    const hash = bcrypt.hashSync(password, SALT)
    await db.collection('users').insertOne({name, email, password: hash})
    return res.sendStatus(201)
  } catch (error) {
    return res.sendStatus(500)
  }

})



const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`rodando na porta ${port}`)
})