const mongoose=require("mongoose");
async function connectToDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "ExpenseTrackerDB",
        });
        console.log("Mongo Db connected");
    } 
    catch (error) {
        console.log(error);
    }
}

module.exports = {connectToDB};