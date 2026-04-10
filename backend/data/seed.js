import dotenv from 'dotenv';
import connectDatabase from '../config/db.js';
import seedInitialData from './seedInitialData.js';

dotenv.config();

const runSeed = async () => {
  await connectDatabase();

  const result = await seedInitialData();

  if (result.seeded) {
    console.log(`Initial seed complete: ${result.products} products, ${result.purchases} purchases.`);
  } else if (result.reason === 'already-seeded') {
    console.log('Seed skipped: initial data already seeded earlier.');
  } else if (result.reason === 'existing-data') {
    console.log('Seed skipped: products or purchases already exist.');
  } else {
    console.log('Seed skipped.');
  }

  process.exit(0);
};

runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});
