# AutoDeleter
DiscordのSelfBOT用のMessageAutoDeleterです。

## 導入方法
**※Node.js NPM git等の導入は事前に済んでいる&ある程度使い方は理解している前提で説明します。** <br>
#### gitを使ってプログラムをインストールします。
```
cd 任意のディレクトリ ←できればCドライブ

git clone https://github.com/ROBOTofficial/AutoDeleter.git
```
#### node_modulesをインストール
```
cd インストールしたディレクトリ

npm install
```
#### 初期値を設定する
1 configファイル内にあるtoken.txtにアカウントトークンをぶち込む (必須)
2 settings.jsonをいじる (任意 ※いじらなくてもOK)
- ここでいじるべきなのは以下のみです。(他はSelfBOTのコマンドで後から変更できます。) <br>
  → `reactionStamp` - 削除対象のメッセージに付くリアクションを指定します。詳細は[こちら](https://github.com/ROBOTofficial/AutoDeleter/edit/main/README.md#%E4%BD%BF%E3%81%84%E6%96%B9)\(必ず2つ選択してください\) <br>
  → `DefaultDelete` - deleteコマンドを打った時にサーチするメッセージ数を決められます(Max100) <br>
  → `DeletePrefix` - ここにある文字をメッセージの最初に付けるとAutoDeleteの対象外になります。 <br>
  → `prefix` - コマンドの文字を指定します。(複数文字可) <br>
- より詳細に設定したい場合は[こちら](https://github.com/ROBOTofficial/AutoDeleter/edit/main/README.md#%E8%A9%B3%E7%B4%B0%E8%A8%AD%E5%AE%9A)を見てください <br>
**※help.txtやstatus.txtはいじらないでください!挙動がおかしくなる可能性があります!**
#### スタートする
```
npm start
```
**※永久起動ではないので永久起動する場合は他にサーバー等を用意してください**
## 使い方
- `helpコマンド` <br>
![image](https://github.com/ROBOTofficial/AutoDeleter/assets/101011695/7e690416-6733-4e23-a7af-92eb711d58f0) <br>
使い方わからなくなったら、大体これ見れば大丈夫 <br>
**settings.jsonを変更してもhelpのテキストは自動で変換されるので安心してください**
## 詳細設定
- settings.jsonについて
## 技術解説
