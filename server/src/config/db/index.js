const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // const conn = await mongoose.connect();
    const conn = await mongoose.connect(
      "mongodb+srv://phuc66dev_db_user:gUUU2Jsku0PEnaAl@authenticate-template.kek83ie.mongodb.net/authenticate-template?retryWrites=true&w=majority",
      {
        tls: true,
      },
    );
    console.log(`MongoDB connected ${conn.connection.host}.`);
  } catch (error) {
    console.log(`MongoDB connection error: ${error}.`);
  }
};

module.exports = connectDB;
