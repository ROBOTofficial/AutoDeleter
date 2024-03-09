import axios from "axios";
import WebSocket from "ws";
import fs from "fs";

process.on("uncaughtExceptionMonitor",(err) => {})

interface infos {
    op:number
    d:{
        content:string
        heartbeat_interval:number
        id:string
        user_id:string
        message_id:string
        emoji:{
            name:string
        }
        token:string
        data:{
            name:string
            options: {
                value: string
            }[];
        }
        guild_id:string
        channel_id:string
        author:{
            id:string
            bot:undefined|boolean
        }
        user:{
            id:string
        }
        member:{
            user:{
                id:string
            }
        }
    }
    t: string
}

const sleep = (millSec:number) => new Promise((response) => setTimeout(response, millSec))

class SelfBOT {
    ws:WebSocket
    token:string
    SelfBotID:string
    heartbeat_interval:NodeJS.Timeout
    DeleteMessageList:string[]
    Config:{
        reaction:boolean
        reactionStamp:string[]
        Delete:boolean
        DefaultDelete:number
        DeletePrefix:string
        DeleteSeconds:number
        prefix:string
    }

    constructor(token:string) {
        this.token = token
        this.SelfBotID = ""
        this.ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json")
        this.heartbeat_interval = setInterval(() => {},10000)
        this.Config = JSON.parse(fs.readFileSync("./config/settings.json","utf-8"))
        this.DeleteMessageList = []
        this.BotStart()
    }
    BotStart() {
        this.ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json")
        this.ws.on('open', () => {
            const StartData = {
                op: 2,
                d: {
                    capabilities:16381,
                    client_state:{
                        guild_versions:{}
                    },
                    compress:false,
                    presence:{
                        status:"online",
                        since:0,
                        activities:[],
                        afk:false
                    },
                    properties:{
                        browser:"Chrome",
                        browser_user_agent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                        browser_version:"122.0.0.0",
                        client_build_number:273388,
                        client_event_source:null,
                        device:"",
                        os:"Windows",
                        os_version:"10",
                        referrer:"",
                        referrer_current:"",
                        referring_domain:"",
                        referring_domain_current:"",
                        release_channel:"stable",
                        system_locale:"ja"
                    },
                    token:this.token
                },
            };
            this.ws.send(JSON.stringify(StartData))
        });
        this.ws.on("message",async (data:string) => {
            const message:infos = JSON.parse(data)
            switch (message.op) {
                case 0:
                    if (message.t === "READY") {
                        this.SelfBotID = message.d.user.id
                    } else if (message.t === "MESSAGE_CREATE" && message.d.author.id === this.SelfBotID) {
                        let args = message.d.content.split(" ")
                        if (message.d.content === `${this.Config.prefix}help`) {
                            let helpTXT = String(fs.readFileSync("./config/help.txt","utf-8").replace(/\{prefix\}/g,this.Config.prefix)).replace(/\{subprefix\}/g,this.Config.DeletePrefix)
                            this.MessageSend(helpTXT,message,true)
                        } else if (message.d.content === `${this.Config.prefix}status`) {
                            let StatusTXT = fs.readFileSync("./config/status.txt","utf-8")
                            StatusTXT = StatusTXT.replace("{auto}",(this.Config.Delete) ? "ON": "OFF")
                            StatusTXT = StatusTXT.replace("{seconds}",String(this.Config.DeleteSeconds/1000))
                            StatusTXT = StatusTXT.replace("{boolean}",(this.Config.reaction) ? "ON": "OFF")
                            StatusTXT = StatusTXT.replace("{reaction}",`( ${this.Config.reactionStamp[0]} / ${this.Config.reactionStamp[1]} )`)
                            StatusTXT = StatusTXT.replace("{command}",`( ${this.Config.prefix} / ${this.Config.DeletePrefix} )`)
                            StatusTXT = StatusTXT.replace("{delete}",String(this.Config.DefaultDelete))
                            this.MessageSend(StatusTXT,message,true)
                        } else if (message.d.content.startsWith(`${this.Config.prefix}sec`) && !isNaN(Number(args[1]))) {
                            this.Config.DeleteSeconds = Number(args[1])*1000
                            fs.writeFileSync("./config/settings.json",JSON.stringify(this.Config,null,"\t"))
                            this.MessageSend(`\`\`\`${args[1]}秒間に設定しました\`\`\``,message,true)
                        } else if (message.d.content.startsWith(`${this.Config.prefix}reaction`) && (args[1] === "on" || args[1] === "off")) {
                            (args[1] === "on") ? this.Config.reaction = true : this.Config.reaction = false
                            fs.writeFileSync("./config/settings.json",JSON.stringify(this.Config,null,"\t"))
                            this.MessageSend(`\`\`\`削除対象メッセージに対するリアクションを${args[1]}にしました。\`\`\``,message,true)
                        } else if (message.d.content.startsWith(`${this.Config.prefix}delete`)) {
                            (isNaN(Number(args[1]))) ? this.ChannelMessageDelete(message,this.Config.DefaultDelete) : this.ChannelMessageDelete(message,Number(args[1]))
                        } else if (message.d.content.startsWith(`${this.Config.prefix}auto`) && (args[1] === "on" || args[1] === "off")) {
                            this.Config.Delete = (args[1] === "on") ? true : false
                            fs.writeFileSync("./config/settings.json",JSON.stringify(this.Config,null,"\t"))
                            this.MessageSend(`\`\`\`自動削除を${args[1]}にしました。\`\`\``,message,true)
                        }
                        if (this.Config.Delete) if (!message.d.content.startsWith(this.Config.DeletePrefix)) this.MessageDelete(message,this.Config.DeleteSeconds)
                    } else if (message.t === "MESSAGE_REACTION_REMOVE" && message.d.user_id === this.SelfBotID && message.d.emoji.name === this.Config.reactionStamp[1]) {
                        this.DeleteMessageList = this.DeleteMessageList.filter(value => value !== message.d.message_id)
                        this.RemoveReaction(message,this.Config.reactionStamp[0])
                    }
                    break
                case 10:
                    clearInterval(this.heartbeat_interval)
                    this.heartbeat(message.d.heartbeat_interval)
                    break
            }
        })
        this.ws.on("close", () => {
            this.BotStart()
        })
    }
    async LoopDelete(ChannelID:string,MessageID:string) {
        for (let i = 0; i < 2; i++) {
            await sleep(2000)
            let response = await axios.delete(
                `https://discord.com/api/v9/channels/${ChannelID}/messages/${MessageID}`,{
                    headers:{
                        "Accept":"*/*",
                        "Accept-Encoding":"gzip, deflate, br",
                        "Accept-Language":"ja,en-US;q=0.9,en;q=0.8",
                        "Authorization":this.token,
                        "Cache-Control":"no-cache",
                        "Content-Type": "application/json",
                        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
                    }
                }
            )
            if (response.status === 204) break
        }
    }
    async ChannelMessageDelete(Message:infos,Count:number) {
        if (100 <= Count) {
            Count = 100
            await this.MessageSend(`\`\`\`100件のメッセージを削除します。\`\`\``,Message,true)
        } else await this.MessageSend(`\`\`\`${Count}件のメッセージを削除します。\`\`\``,Message,true)
        let response = await axios.get(
            `https://discord.com/api/v9/channels/${Message.d.channel_id}/messages?limit=${Count}`,{
                headers:{
                    Accept:"*/*",
                    "Accept-Encoding":"gzip, deflate, br, zstd",
                    "Accept-Language":"ja,en-US;q=0.9,en;q=0.8",
                    Authorization:this.token,
                    "Cache-Control":"no-cache",
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                }
            }
        )
        let MessageLIST:Array<{
            author:{
                id:string
            }
            channel_id:string
            id:string
        }> = response.data
        for (let i = 0; i < MessageLIST.length; i++) if (MessageLIST[i].author.id === this.SelfBotID) {
            await sleep(Math.floor(Math.random()*(500+1-100))+100)
            await axios.delete(
                `https://discord.com/api/v9/channels/${MessageLIST[i].channel_id}/messages/${MessageLIST[i].id}`,{
                    headers:{
                        "Accept":"*/*",
                        "Accept-Encoding":"gzip, deflate, br",
                        "Accept-Language":"ja,en-US;q=0.9,en;q=0.8",
                        "Authorization":this.token,
                        "Cache-Control":"no-cache",
                        "Content-Type": "application/json",
                        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
                    }
                }
            ).catch(() => this.LoopDelete(MessageLIST[i].channel_id,MessageLIST[i].id))
        }
    }
    async AddReaction(Message:infos,content:string):Promise<void> {
        await axios.put(
            `https://discord.com/api/v9/channels/${Message.d.channel_id}/messages/${Message.d.id}/reactions/${encodeURIComponent(content)}/%40me?location=Message&type=0`,{},{
                headers:{
                    Accept:"*/*",
                    "Accept-Encoding":"gzip, deflate, br, zstd",
                    "Accept-Language":"ja,en-US;q=0.9,en;q=0.8",
                    Authorization:this.token,
                    "Cache-Control":"no-cache",
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                }
            }
        ).catch(() => {})
        return
    }
    async RemoveReaction(Message:infos,content:string) {
        await axios.delete(
            `https://discord.com/api/v9/channels/${Message.d.channel_id}/messages/${Message.d.message_id}/reactions/${encodeURIComponent(content)}/0/%40me?location=Message&burst=false`,{
                headers:{
                    Accept:"*/*",
                    "Accept-Encoding":"gzip, deflate, br, zstd",
                    "Accept-Language":"ja,en-US;q=0.9,en;q=0.8",
                    Authorization:this.token,
                    "Cache-Control":"no-cache",
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                }
            }
        ).catch(() => {})
    }
    async DeleteReaction(Message:infos) {
        if (this.Config.reaction === true) for (let i = 0; i < this.Config.reactionStamp.length; i++) {
            await sleep(Math.floor(Math.random()*(1600+1-400))+400)
            await this.AddReaction(Message,this.Config.reactionStamp[i])
        }
    }
    async MessageDelete(Message:infos,time:number|null) {
        this.DeleteMessageList.push(Message.d.id)
        this.DeleteReaction(Message)
        if (time !== null) await sleep(time+Math.floor(Math.random()*400))
        if (!this.DeleteMessageList.includes(Message.d.id)) return
        await axios.delete(
            `https://discord.com/api/v9/channels/${Message.d.channel_id}/messages/${Message.d.id}`,
            {
                headers:{
                    "Accept":"*/*",
                    "Accept-Encoding":"gzip, deflate, br",
                    "Accept-Language":"ja,en-US;q=0.9,en;q=0.8",
                    "Authorization":this.token,
                    "Cache-Control":"no-cache",
                    "Content-Type": "application/json",
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
                }
            }
        ).catch(() => {})
        this.DeleteMessageList = this.DeleteMessageList.filter(value => value !== Message.d.id)
    }
    async MessageSend(content:string,Message:infos,reply:boolean) {
        let MessageContent:{[key:string]:object|string|boolean} = {
            content:content,
            tts:false
        }
        if (reply === true) MessageContent["message_reference"] = {
            guild_id:Message.d.guild_id,
            channel_id:Message.d.channel_id,
            message_id:Message.d.id
        }
        await axios.post(
            `https://discord.com/api/v9/channels/${Message.d.channel_id}/messages`,JSON.stringify(MessageContent), {
                headers:{
                    "Accept":"*/*",
                    "Accept-Encoding":"gzip, deflate, br",
                    "Accept-Language":"ja,en-US;q=0.9,en;q=0.8",
                    "Authorization":this.token,
                    "Cache-Control":"no-cache",
                    "Content-Type": "application/json",
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
                }
            }
        ).catch(() => {})
    }
    heartbeat(heartbeat_interval:number) {
        this.heartbeat_interval = setInterval(() => {
            let date = new Date()
            this.ws.send(JSON.stringify({
                op:1,
                d:date.getTime()
            }))
        },heartbeat_interval)
    }
}
new SelfBOT(fs.readFileSync("./config/token.txt","utf-8"))