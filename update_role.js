const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/uteshop_db').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('users').updateOne({ email: 'admin@uteshop.vn' }, { $set: { role: 'admin' } });
  console.log('Role updated to admin!');
  process.exit(0);
});
