import express from 'express'
import { config } from 'dotenv'

import { initiateApp } from './src/initiate-app.js'
import cors from "cors";


config({ path: './config/dev.config.env' })

const app = express()
app.use(cors({ origin: 'http://localhost:8081' }));
initiateApp(app, express)
