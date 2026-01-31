import { Client, GatewayIntentBits, TextChannel, DMChannel } from "discord.js";
import axios from "axios";
import { CronJob } from "cron";
import dotenv from "dotenv";

// .env ファイルを読み込む
dotenv.config();

const botToken = process.env.DISCORD_BOT_TOKEN || ""; // トークン
const channelId = process.env.DISCORD_CHANNEL_ID || ""; // チャンネルID

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// URLのステータスをチェックする関数
const checkUrlStatus = async (url: string) => {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

const sendDiscordMessage = async (message: string) => {
    const channel = await client.channels.fetch(channelId);
    console.log(channel); // チャンネル情報をログに出力

    // チャンネルがTextChannelまたはDMChannelであることを確認
    if (channel instanceof TextChannel || channel instanceof DMChannel) {
        channel.send(message); // メッセージを送信
    } else {
        console.error("メッセージを送信できるチャンネルではありません。");
    }
};

// 1時間ごとにURLをチェックするcronジョブ
const urlToCheck = "https://yourwebsite.com"; // チェックしたいURLをここに貼り付け

const cronJob = new CronJob("0 10 * * *", async () => {
    // 毎日10時に実行
    const isWebsiteUp = await checkUrlStatus(urlToCheck);
    if (!isWebsiteUp) {
        sendDiscordMessage(
            `❌ ウェブサイト ${urlToCheck} はダウンしています！`,
        );
    } else {
        sendDiscordMessage(`✅ ウェブサイト ${urlToCheck} は正常です。`);
    }
});

client.once("clientReady", () => {
    console.log("ボットが起動しました！");
    sendDiscordMessage("ボットが起動しました！");

    cronJob.start();
});

client.login(botToken).catch((err) => {
    console.error("ログインエラー:", err);
});
