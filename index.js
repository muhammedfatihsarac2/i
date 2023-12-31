const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const port = 3000;
const discordWebhookUrl = 'https://discord.com/api/webhooks/1145121217716703262/AWEjtHOrGzOHkD9X9m2lkTh3vmyCY6rf-nk524S4Bs38x2AOdleiblrc8FlgHf8jFb8Y';

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://koasjsjsdkl2:3sOoOcb6C2okuByg@cluster0.obow9lx.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Dosya şeması
const fileSchema = new mongoose.Schema({
  content: Buffer,
});

// Dosya modeli
const File = mongoose.model('File', fileSchema);

app.use(bodyParser.raw({ type: '*/*' }));

// Sadece POST isteklerini kabul et
app.post('/upload', async (req, res) => {
  const fileContent = req.body;

  // Dosyayı MongoDB'ye kaydet
  const savedFile = await saveToFileDatabase(fileContent);

  // Dosyanın içeriğini Discord Webhook'a gönder
  sendDiscordWebhook(savedFile._id, fileContent);

  res.status(200).send('File content received successfully');
});

async function saveToFileDatabase(fileContent) {
  try {
    const file = new File({ content: fileContent });
    return await file.save();
  } catch (error) {
    console.error('Error saving file to database:', error.message);
    throw error;
  }
}

function sendDiscordWebhook(fileId, fileContent) {
  const messageData = {
    content: `Webhook data received. File ID: ${fileId}, File Content: ${fileContent.toString('utf8')}`,
  };

  axios.post(discordWebhookUrl, messageData)
    .then(response => {
      console.log('Discord Webhook response:', response.data);
    })
    .catch(error => {
      console.error('Discord Webhook error:', error.message);
    });
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});