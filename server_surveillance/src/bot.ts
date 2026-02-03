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

    // チャンネルがTextChannelまたはDMChannelであることを確認
    if (channel instanceof TextChannel || channel instanceof DMChannel) {
        channel.send(message); // メッセージを送信
    } else {
        console.error("メッセージを送信できるチャンネルではありません。");
    }
};


const checkURL:string[] = [
    "https://tech-blog.sonitan-lab.com",
    "https://sonitan-lab.com",
    "https://hiragana-quiz.etolog.jp/",
    "https://child-study.etolog.jp/",
    process.env.SUPABASE_URL ? process.env.SUPABASE_URL:""
]

const checkUrl = async () => {
    const resultList = await Promise.all(
        checkURL.map((url) => 
            checkUrlStatus(url))
    );
    sendDiscordMessage(`${resultList.map((r, i) => `${checkURL[i]}: ${r ? "✅" : "❌"}`).join("\n")}`);
}

const cronJob = new CronJob("0 10 * * *", async () => {
    // 毎日10時に実行
    await checkUrl()
});

client.once("clientReady", () => {
    sendDiscordMessage("ボットが起動しました！");
    checkUrl()

    cronJob.start();
});

client.login(botToken).catch((err) => {
    console.error("ログインエラー:", err);
});
