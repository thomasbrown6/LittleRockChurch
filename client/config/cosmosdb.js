const mongoose = require('mongoose');
const config = require('config');
//const db = config.get('azureCosmo');
// const db =
  // 'mongodb://daycaremanagerdb:5UaiyWu6u0GcsB4yxfiX6l3kcSU92JxotR9Ig29p38Jbiu3FtcHll1Q4ywkvS6a7lulRag4EFt6f4CHl0F8Hdw%3D%3D@daycaremanagerdb.documents.azure.com:10255/?ssl=true';

  const db = 'mongodb+srv://thomasbrown1125:tabrown11@daycaremanager-vxhfs.mongodb.net/test?retryWrites=true&w=majority'
  
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
