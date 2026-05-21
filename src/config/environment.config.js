import dotenv from "dotenv";
dotenv.config();

const ENVIRONMENT = {
    PORT: process.env.PORT || 8080,
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    MODE: process.env.MODE,
    GMAIL_USERNAME: process.env.GMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET
}

export default ENVIRONMENT;