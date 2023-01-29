import {Router} from 'express'
import {signUp, signIn} from './../controllers/auth.controllers.js'

const auth = Router()

auth.post("/sign-up", signUp);
auth.post("/sign-in", signIn);

export default auth