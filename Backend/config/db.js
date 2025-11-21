import mongoose from 'mongoose'

async function Database() {
    let MONGO=process.env.MONGO_DB
    if (!MONGO) {
        console.error("❌ MONGO_DB is not defined in environment variables")
        return
    }
    try {
        await mongoose.connect(MONGO)
        console.log("Database Connected");
    } catch (error) {
        console.error("❌ Database Connection Error:", error.message)
        process.exit(1)
    }
}

export default Database;