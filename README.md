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
  → `reactionStamp` - 削除対象のメッセージに付くリアクションを指定します。詳細は[こちら](https://github.com/ROBOTofficial/AutoDeleter?tab=readme-ov-file#%E4%BD%BF%E3%81%84%E6%96%B9)\(必ず2つ選択してください\) <br>
  → `DefaultDelete` - deleteコマンドを打った時にサーチするメッセージ数を決められます(Max100) <br>
  → `DeletePrefix` - ここにある文字をメッセージの最初に付けるとAutoDeleteの対象外になります。 <br>
  → `prefix` - コマンドの文字を指定します。(複数文字可) <br>
- より詳細に設定したい場合は[こちら](https://github.com/ROBOTofficial/AutoDeleter/tree/main?tab=readme-ov-file#%E8%A9%B3%E7%B4%B0%E8%A8%AD%E5%AE%9A)を見てください <br>
**※help.txtやstatus.txtはいじらないでください!挙動がおかしくなる可能性があります!**
#### スタートする
```
npm start
```
**※永久起動ではないので永久起動する場合は他にサーバー等を用意してください**
## 使い方
デフォルトのprefixが?なので画像等は?で統一されています。(実際はほかでも大丈夫です)<br>
- `helpコマンド` - 使い方わからなくなったら、大体これ見れば大丈夫 <br>
![image](https://github.com/ROBOTofficial/AutoDeleter/assets/101011695/f3bc4cbc-6736-4e17-a3ef-efe41061a2b5) <br>
- `statusコマンド` - 現在の設定が分かります。 <br>
![image](https://github.com/ROBOTofficial/AutoDeleter/assets/101011695/2124d96c-cca5-4a3c-baba-7e2a3a7fa149) <br>
- `secコマンド` - 削除までの秒数を指定します。 <br>
![image](https://github.com/ROBOTofficial/AutoDeleter/assets/101011695/17d28b2e-0da9-4941-a203-544c34040ea1) <br>
- `autoコマンド` - 自動削除のON/OFFを切り替えます。 <br>
![image](https://github.com/ROBOTofficial/AutoDeleter/assets/101011695/9249a92a-91a8-4e74-8195-101cb29e894c) <br>
- `reactionコマンド` - リアクションのON/OFFを切り替えます。 <br>
![image](https://github.com/ROBOTofficial/AutoDeleter/assets/101011695/bb0a1bba-0e8c-4b17-92c6-30569c74d744) <br>
- `deleteコマンド` - コマンドを実行したチャンネルの自分のメッセージを削除します。<br>
```
?delete ←statusのDefaultDeleteの数が参照されます
?delete 30 ←この場合30個前までメッセージをさかのぼって消去します。(最大100)
```
- `非削除コマンド` - 最初に非削除コマンド(デフォルトは!)があるメッセージは削除されません。 <br>
- `削除中断` - 削除中断リアクション(デフォルトは❌)を押すと削除を中断できる。<br>
![image](https://github.com/ROBOTofficial/AutoDeleter/assets/101011695/8aedc58a-a767-4740-aece-56192d11ff60) <br>

**settings.jsonを変更してもhelpやstatus等のテキストは自動で変換されるので安心してください**
## 諸注意
遅延を付けたりdeleteコマンドに関してはエラーの際は繰り返し実行をすることによって、**出来るだけレートリミットがかからないようにしていますが、** たまにレートリミットで削除されないときがあります。ご了承ください。<br>
長期的に起動できるようにエラーを無効化しています。(嫌な場合は自分で治してください)
2024/3/9時点で特にtoken凍結等は、かかっていませんが、今後規制が厳しくなるにつれて凍結されるリスクがあります。**自己責任で使ってください**
## 詳細設定
- settings.jsonについて

  →意図していない部分をいじるとエラーにつながる可能性があるので注意してください
  
  →DefaultDelete等に関しては100以上の数値を入れても自動的に100に変換されるので注意してください。

  →reactionStampは2個目が削除中断のリアクションに必ずなります。
## 改変データ
- 公開してから1時間後<br>
デフォルトprefixを#→?に変更
## 技術解説
axios → リクエスト系統に利用<br>
ws → WebSocket系統に利用<br>
あとは自分で読み解いてください。解説は面倒くさい
## エラー報告等の連絡先
- `DiscordID:`robot_official
- `TwitterID:`robot_neet

**※上記の連絡先以外には連絡してこないでください**
