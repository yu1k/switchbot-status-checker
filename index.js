"use strict";

const axios = require("axios");

const path = require("path");
const ENV_FILE_PATH = path.join(__dirname, "./config.env");
require("dotenv").config({ path: ENV_FILE_PATH });

/**
 * 必要な環境変数をチェックする
 * 設定されていない場合は process.exit(1) する。
 */
 if (!(process.env.TARGET_ENDPOINT_URL || process.env.API_VERSION || process.env.SECRET_TOKEN || process.env.CLIENT_SECRET || process.env.API_ACCESS_INTERVAL_TIME || process.env.SLACK_WEBHOOK_URL || process.env.SLACK_POST_CHANNEL)) {
    console.log(
        "###############################" + "\n" +
        "# Please set env parameter... #" + "\n" +
        "###############################"
    );
    process.exit(1);
}

/**
 * Slackへ通知する関数
 * 引数はSlackへ通知する際のメッセージをStringで指定する。
 */
async function slackPost(message_text){
    let SLACK_WEBHOOK_OPTIONS_HEADERS = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }
    };

    try {
        let msg = String(message_text);
        const slackPost = await axios.post(process.env.SLACK_WEBHOOK_URL, {
            'channel': process.env.SLACK_POST_CHANNEL,
            'username': 'SwitchBot 状態確認くん',
            'text': `${msg}`,
            'icon_emoji': ':email:'
        }, {
            'headers': SLACK_WEBHOOK_OPTIONS_HEADERS
        });
        return slackPost;
    } catch (err) {
        console.log("error status: " + err);
    }

}

// true or false
// trueだったら高い, falseだったら低い
let tempUpperTemperatureFlag = false;
let tempUpperTemperature = null;
// trueだったら低い, falseだったら高い
let tempLowerTemperatureFlag = false;
let tempLowerTemperature = null;
async function main() {
    // ログ用
    let cDate = new Date();
    console.log("Current date: " + cDate);

    /**
     * Request Header: https://github.com/OpenWonderLabs/SwitchBotAPI#request-header
     * sign sample: https://github.com/OpenWonderLabs/SwitchBotAPI#how-to-sign
     */
    const crypto = require("crypto");
    let timeStamp = new Date().getTime();
    const nonce = "requestID";
    const data = process.env.SECRET_TOKEN + timeStamp + nonce;
    const signTerm = crypto.createHmac("sha256", process.env.CLIENT_SECRET)
        .update(Buffer.from(data, "utf-8"))
        .digest();
    const sign = signTerm.toString("base64");
    // デバッグ用
    // console.log("sign: " + sign);

    const axiosRequestHeader = {
        "Content-Type": "application/json; charset=UTF-8",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
        "Authorization": process.env.SECRET_TOKEN,
        "sign": sign,
        "nonce": nonce,
        "t": timeStamp.toString()
    };

    try {
        let response = await axios.get(`${process.env.TARGET_ENDPOINT_URL}${process.env.API_VERSION}/` + "devices" + `/${process.env.METER_DEVICE_ID}/status`, {
            headers: axiosRequestHeader
        });
        console.log("response status code: " + response.status);
        console.log(response.data.body.temperature);

        if (Number(process.env.UPPER_LIMIT_TEMPERATURE) <= response.data.body.temperature && tempUpperTemperatureFlag != true) {
            slackPost(`設定した上限温度を上回りました。\n現在の室温: ${String(response.data.body.temperature)} 度`);
            tempUpperTemperatureFlag = true;

            // 上限温度を上回った現在の温度を格納
            // tempUpperTemperature = response.data.body.temperature;
        }
        if(response.data.body.temperature < Number(process.env.UPPER_LIMIT_TEMPERATURE) && tempUpperTemperatureFlag != false){
            slackPost(`設定した上限温度を下回りました。\n現在の室温: ${String(response.data.body.temperature)} 度`);
            tempUpperTemperatureFlag = false;

            // 変数を初期化
            // tempUpperTemperature = null;
        }


        if(response.data.body.temperature < Number(process.env.LOWER_LIMIT_TEMPERATURE) && tempLowerTemperatureFlag != true){
            slackPost(`設定した下限温度を下回りました。\n現在の室温: ${String(response.data.body.temperature)} 度`);
            tempLowerTemperatureFlag = true;

            // 下限温度を下回った現在の室温を格納
            // tempLowerTemperature = response.data.body.temperature;
        }
        if(Number(process.env.LOWER_LIMIT_TEMPERATURE) < response.data.body.temperature && tempLowerTemperatureFlag != false){
            slackPost(`設定した下限温度を上回りました。\n現在の室温: ${String(response.data.body.temperature)} 度`);
            tempLowerTemperatureFlag = false;

            // 変数を初期化
            // tempLowerTemperature = null;
        }
    } catch (err) {
        console.log("error response status: " + err);
        console.log(timeStamp);
    }
}

// intervalの前にmain関数を初回実行する
main();
// 定時実行する
setInterval(main, (process.env.API_ACCESS_INTERVAL_TIME * 1000));