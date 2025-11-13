import {app} from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path : "./.env"
})
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