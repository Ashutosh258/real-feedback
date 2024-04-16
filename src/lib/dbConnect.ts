import mongoose from "mongoose";

type connectionObjext = {
    isConnected?: Number
}


const connection:connectionObjext={}

async function dbConnect():Promise<void> {
    if(connection.isConnected){
        console.log("Already connected to db")
    }
    try{
       const db= await mongoose.connect(process.env.MONGODB_URI || '',{})
       connection.isConnected=db.connections[0].readyState

       console.log("DB connected successfully");
    }catch(error){
        console.log("DB connection failed")
        process.exit(1)
    }
}

export default dbConnect;