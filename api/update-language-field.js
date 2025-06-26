const mongoose = require('mongoose');
require('dotenv').config();

async function updateLanguageField() {
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

    // Перейменовуємо поле language на film_language
    const result = await moviesCollection.updateMany(
      { language: { $exists: true } },
      { $rename: { language: "film_language" } }
    );

    console.log(`✅ Оновлено ${result.modifiedCount} документів`);
    console.log(`📊 Знайдено ${result.matchedCount} документів з полем language`);

    // Перевіряємо результат
    const sampleDoc = await moviesCollection.findOne({ film_language: { $exists: true } });
    if (sampleDoc) {
      console.log('📋 Приклад оновленого документу:', {
        title: sampleDoc.title,
        film_language: sampleDoc.film_language
      });
    }

    // Створюємо новий індекс для film_language
    await moviesCollection.createIndex({ film_language: 1 });
    console.log('✅ Створено індекс для поля film_language');

  } catch (error) {
    console.error('❌ Помилка:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Відключено від MongoDB');
    process.exit(0);
  }
}

updateLanguageField();