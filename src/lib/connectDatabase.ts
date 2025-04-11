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
        console.log("Something went wrong!");
        console.log(error.message);
        process.exit(1);
    }
}

export default dbconnect;