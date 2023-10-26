'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const { ObnizHandler } = require('./handleObniz');
const { arrayMapper } = require('./arrayMapper');
require('dotenv').config();

const obnizHandler = new ObnizHandler(process.env.OBNIZ_TOKEN || 'コピペ');

const PORT = process.env.PORT || 3000;

// Messaging APIを利用するための鍵を設定します。
const config = {
  channelSecret: process.env.CHANNEL_SECRET || 'コピペ',
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'コピペ'
};
const webhookURL = process.env.WEBHOOK_URL || 'コピペ';

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  const { replyToken } = event;
  const { text } = event.message;
  const { userId } = event.source;
  // ユーザーにリプライメッセージを送ります。

  if (text === 'start') {
    await obnizHandler.powerOn();
    client.replyMessage(replyToken, {
      type: 'text',
      text: '接続しました'
    });
  } else if (text === 'end') {
    const connectState = obnizHandler.getConnectState();
    if (connectState !== 'connected') {
      return client.replyMessage(replyToken, {
        type: 'text',
        text: '演奏を開始してください'
      })
    }

    await obnizHandler.powerOff()
    client.replyMessage(replyToken, {
      type: 'text',
      text: '終了しました'
    })

    const resultStr = arrayMapper(obnizHandler.getResult())
    if (resultStr) {
      client.pushMessage(userId, {
        type: 'text',
        text: resultStr
      })
      const res = await fetch(webhookURL, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          result: resultStr
        })
      });
      const text = await res.text();
      console.log(text);
    } else {
      client.pushMessage(userId, {
        type: 'text',
        text: '演奏が実施されませんでした'
      })
    }
  } else{
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: event.message.text
    });
  }
}

// ここ以降は理解しなくてOKです
const app = express();
app.get('/', (req, res) => res.send('Hello LINE BOT! (HTTP GET)'));
app.post('/webhook', line.middleware(config), (req, res) => {

  if (req.body.events.length === 0) {
    res.send('Hello LINE BOT! (HTTP POST)');
    console.log('検証イベントを受信しました！');
    return;
  } else {
    console.log('受信しました:', req.body.events);
  }

  Promise.all(req.body.events.map(handleEvent)).then((result) => res.json(result));
});

app.listen(PORT);
console.log(`ポート${PORT}番でExpressサーバーを実行中です…`);