import dotenv from "dotenv"
dotenv.config({
    path : "./.env"
})
import {app} from "./app.js"
import connectDB from "./db/index.js";

const port = process.env.PORT || 9000;


connectDB()
.then(()=>{
    app.listen(port, ()=>{
        console.log(`server running on ${port}`)
    })
})
.catch((err)=>{
    console.log("Mongodb connection error", err);
})