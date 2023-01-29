import {Router} from 'express'
import {signUp, signIn} from './../controllers/auth.controllers.js'
import { signUpValidation } from '../middlewares/auth.middlewares.js';

const auth = Router()

auth.post("/sign-up", signUpValidation ,signUp);
auth.post("/sign-in", signIn);

export default auth