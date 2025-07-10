const express = require("express")
const mongoose = require("mongoose")
require('dotenv').config();

const app = express();
app.use(express.json());

const callsRoutes = require('./routes/calls');

mongoose.connect(process.env.MongoDB_URI).then(()=>console.log("MongoDB Connected")).catch((err)=>console.log("error connecting database:", err))
app.use('/api/calls', callsRoutes);

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> console.log(`server running at http://localhost:${PORT}`))

