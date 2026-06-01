require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const collection = mongoose.connection.db.collection('carts');
    
    // First, drop problematic indexes
    console.log('Dropping indexes...');
    try {
      await collection.dropIndex('user_1');
      console.log('Dropped user_1 index');
    } catch (err) {
      if (err.message.includes('index not found')) {
        console.log('user_1 index does not exist');
      } else {
        console.error('Error dropping index:', err.message);
      }
    }
    
    // Find problematic carts
    console.log('Finding legacy carts with issues...');
    const problematicCarts = await collection.find({
      $or: [
        { user_id: { $exists: false } },
        { user: { $exists: true } }
      ]
    }).toArray();
    
    console.log(`Found ${problematicCarts.length} problematic carts`);
    
    if (problematicCarts.length > 0) {
      console.log('Sample problematic carts:', problematicCarts.slice(0, 3));
    }
    
    // Delete carts with no user_id and null user
    const deleteResult = await collection.deleteMany({
      user_id: { $exists: false },
      user: null
    });
    
    console.log(`Deleted ${deleteResult.deletedCount} legacy carts with null user`);
    
    // For carts with both user and user_id, migrate them
    const migrationResult = await collection.updateMany(
      { user_id: { $exists: false }, user: { $exists: true, $ne: null } },
      [
        {
          $set: {
            user_id: '$user'
          }
        },
        {
          $unset: 'user'
        }
      ]
    );
    
    console.log(`Migrated ${migrationResult.modifiedCount} legacy carts with user field`);
    
    // Check for duplicate user_id entries (should not happen with unique index)
    const duplicates = await collection.aggregate([
      {
        $group: {
          _id: '$user_id',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();
    
    if (duplicates.length > 0) {
      console.log('Found duplicate user_ids:');
      for (const dup of duplicates) {
        console.log(`  user_id: ${dup._id}, count: ${dup.count}`);
        // Keep first, delete others
        const [keep, ...toDelete] = dup.ids;
        for (const id of toDelete) {
          await collection.deleteOne({ _id: id });
          console.log(`  Deleted duplicate cart ${id}`);
        }
      }
    }
    
    // Create proper unique index on user_id
    console.log('Creating user_id unique index...');
    try {
      await collection.createIndex({ user_id: 1 }, { unique: true });
      console.log('Created unique index on user_id');
    } catch (err) {
      console.error('Error creating index:', err.message);
    }
    
    // List remaining carts
    const remainingCount = await collection.countDocuments();
    console.log(`\nTotal carts remaining: ${remainingCount}`);
    
    const remainingCarts = await collection.find({}).limit(5).toArray();
    console.log('Sample remaining carts:', remainingCarts);
    
  } catch (error) {
    console.error('Cleanup error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanup();

