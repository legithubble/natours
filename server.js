const mongoose = require('mongoose');
const dotenv = require('dotenv');

// process.on("uncaughtException", (err) => {
//   console.log(err.name, err.message);
//   console.log("Error : Unhandled Exception. Shutting down...")
//     process.exit(1)
// })

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });

const app = require('./app');

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Error : Unhandled Rejection. Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

// Heroku shuts down the server abruptly every 24hrs. this listening function makes it such that our app shuts down gracefully and doesn't leave any request hanging
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED, shutting down server gracefully...');
  server.close(() => {
    console.log('Process Terminated');
  });
});
