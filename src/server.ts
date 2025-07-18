/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import 'dotenv/config';
import { envVars } from './app/config/env';
import app from './app';
import { seedSuperAdmin } from './app/utils/seedSuperAdmin';

let server: Server;

const startServer = async () => {
  try {
    console.log(envVars.NODE_ENV);

    await mongoose.connect(envVars.DB_URL);

    console.log('connected to db');

    server = app.listen(envVars.PORT, () => {
      console.log(`server is listening port ${envVars.PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
})();

process.on('unhandledRejection', err => {
  console.log('Unhandled Rejection detected... server shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on('uncaughtException', err => {
  console.log('Uncaugth Exception detected... server shutting dawn...', err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('Sigterm signal recieved... server shutting down...');

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Sigint signal recieved... server shutting down...');

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// unhandled rejection error
// Promise.reject(new Error('I forgot to catch this promise'));

// uncaught exception error
// throw new Error('I Forgot to handle this local error');
