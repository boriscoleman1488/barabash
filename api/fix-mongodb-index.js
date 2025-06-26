const mongoose = require('mongoose');
require('dotenv').config();

async function fixMongoDBIndex() {
  try {
    // Підключаємося до бази даних
    await mongoose.connect(process.env.MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Підключено до MongoDB');

    // Отримуємо колекцію movies
    const db = mongoose.connection.db;
    const moviesCollection = db.collection('movies');

    // Отримуємо всі індекси
    const indexes = await moviesCollection.indexes();
    console.log('📋 Поточні індекси:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Видаляємо всі текстові індекси
    for (const index of indexes) {
      if (index.name !== '_id_' && (
        index.textIndexVersion || 
        index.default_language || 
        Object.values(index.key || {}).includes('text')
      )) {
        try {
          await moviesCollection.dropIndex(index.name);
          console.log(`🗑️ Видалено індекс: ${index.name}`);
        } catch (error) {
          console.log(`⚠️ Не вдалося видалити індекс ${index.name}:`, error.message);
        }
      }
    }

    // Створюємо нові прості індекси
    await moviesCollection.createIndex({ title: 1 });
    await moviesCollection.createIndex({ description: 1 });
    await moviesCollection.createIndex({ genres: 1 });
    await moviesCollection.createIndex({ releaseYear: 1 });
    await moviesCollection.createIndex({ type: 1 });
    await moviesCollection.createIndex({ 'pricing.isFree': 1 });

    console.log('✅ Створено нові індекси');

    // Перевіряємо результат
    const newIndexes = await moviesCollection.indexes();
    console.log('📋 Нові індекси:', newIndexes.map(idx => ({ name: idx.name, key: idx.key })));

  } catch (error) {
    console.error('❌ Помилка:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Відключено від MongoDB');
    process.exit(0);
  }
}

fixMongoDBIndex();