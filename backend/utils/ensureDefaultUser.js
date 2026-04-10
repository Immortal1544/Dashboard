import bcrypt from 'bcrypt';
import User from '../models/User.js';

const DEFAULT_USERNAME = 'sunil';
const DEFAULT_PASSWORD = 'Sunil@01';

const ensureDefaultUser = async () => {
  const userCount = await User.countDocuments();

  if (userCount > 0) {
    console.log('User exists. Skipping default user creation.');
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await User.create({
    username: DEFAULT_USERNAME,
    password: hashedPassword
  });

  console.log('Default user created: sunil');
};

export default ensureDefaultUser;
