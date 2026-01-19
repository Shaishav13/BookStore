import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";

// Load environment variables for testing
dotenv.config();

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);
});

//afterAll(async () => {
  //await mongoose.connection.dropDatabase();
  //await mongoose.connection.close();
  //await mongo.stop();
//});
