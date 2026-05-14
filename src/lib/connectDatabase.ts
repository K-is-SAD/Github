/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

type ConnectionObject = {
    isconnected? : number
}

const connection : ConnectionObject = {}

async function dbconnect():Promise<void>{
    if(connection.isconnected){
        console.log("Already connected to MongoDB database");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
        connection.isconnected = db.connections[0].readyState;
        console.log("Connected to MongoDB database");
    } catch (error : any) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("MongoDB connection failed:", message);
        throw new Error(
            `Failed to connect to MongoDB. ${message}. If you are using a mongodb+srv URI, verify DNS/SRV access or switch to the standard MongoDB connection string.`
        );
    }
}

export default dbconnect;