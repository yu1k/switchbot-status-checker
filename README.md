# switchbot-status-checker

## description

SwitchBot 状態確認くん です。

SwitchBot API経由で室温等の部屋の情報を取得するツールです。

事前に設定された条件に従って監視・Slackへのアラートも行います。

## Requirement

### 確認済みの環境:

- OS: Ubuntu 20.04
- シェル: bash
- Node.js Version: v18.12.0
- docker -v: Docker version 20.10.18
- docker-compose -v: docker-compose version 1.29.2

## Usage

### Dockerコンテナ上の環境で動かしたい場合

1. 以下のコマンドを実行してローカルにGitHubからcloneします。

```
$ git clone https://github.com/yu1k/switchbot-status-checker.git switchbot-status-checker && cd $_
```

2. `./config.env` ファイルに各種設定を書きます。

```
#
# sample
#
TARGET_ENDPOINT_URL='https://api.switch-bot.com/'

API_VERSION='v1.1'
APIのバージョンを記載します。サンプルではv1.1を利用します。

SECRET_TOKEN=''
APIのシークレットトークンを設定します。

CLIENT_SECRET=''
クライアントシークレットを設定します。

API_ACCESS_INTERVAL_TIME=''
SwitchBot APIでSwitchBotの情報を取得する間隔を設定します。秒単位で指定します。

#
# 温度計
#
METER_DEVICE_ID=''
温度計デバイスのIDを設定します。
iOSアプリ等にて対象METERのデバイスIDを取得する場合は、デバイスIDは 温湿度計を選択->右上の歯車マークを選択->デバイス情報を選択 します。画面内のBLE MACのMACアドレスからコロンを取った12桁の文字列がデバイスIDです。

UPPER_LIMIT_TEMPERATURE=''
上限温度を設定します。

LOWER_LIMIT_TEMPERATURE=''
下限温度を設定します。


# Slack
SLACK_WEBHOOK_URL=''
SlackへWebhook経由で通知するので、Webhook URLをSlackから取得して設定します。
```

3. 以下のコマンドを実行してアプリケーションを実行します。

```
$ docker-compose up -d --build
docker-compose を利用してコンテナを起動させます。
```

4. 停止や再起動したい場合は以下のコマンドを実行します。

```
$ docker-compose restart [container_name]
指定したコンテナを再起動します。

$ docker-compose stop [container_name]
指定したコンテナを停止します。

$ docker-compose down --rmi local
起動したコンテナを停止し、コンテナ、ネットワーク、ボリューム、イメージ等の関連するリソースを削除します。
```

### ホストOSの環境で動かしたい場合

...

## 機能

- [x] SwitchBotの温湿度計からSwitchBot API経由で温度を取得して決められた温度に従って監視する。事前に設定された上限・下限温度に達したらSlackへアラートを飛ばす

## SwitchBot API 参考資料

[SwitchBot API v1.1 - OpenWonderLabs/SwitchBotAPI](https://github.com/OpenWonderLabs/SwitchBotAPI)