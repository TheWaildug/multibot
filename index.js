const Discord = require("discord.js")
const client = new Discord.Client()
const fs = require("fs")    

const ms = require("ms")

const fetch = require("node-fetch")
const Database = require("@replit/database")
const jsonfile = require("jsonfile")
const math = require("mathjs")
const db = new Database()
const express = require("express")
const server = express()  
const redditFetch = require("reddit-fetch")
const makesuggestion = require("./makesuggestion.js")
const AutoPoster = require('topgg-autoposter')
const GuildPrefix = require('./prefixmongo');
const CountingEnable = require('./countingenable');
const mongoose = require("mongoose")
mongoose.connect(process.env.mongourl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => console.log("Connected to MongoDB")).catch(error => {
  console.log(error)
})
client.Commands = new Discord.Collection();
let stats = {}
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}


async function getData(key){
  
  

    const data = await db.get(key);
  
    return data
  }
  async function setData(key,data){
    await db.set(key,data);
    console.log('i think it worked')
    return
  }
  async function removeData(key){
    console.log('remove data')
    db.delete(key).then(() => {
      console.log(`Successfully removed the key ${key}`)
      return  })
  }
  
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
async function run(key,message) {
    console.log('run function')
    
    const data = await getData(key);
    console.log(data); // will print your data
    if(message){
    return message.reply("Here's the data I found from the key " + key + ": `" +   data + '`')
    }
  }
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.Commands.set(command.name, command);
}
async function UpdateGuilds(){
  setInterval(async () => {
    const status = await db.get(`Status`)
    if(!status.toLowerCase().includes("{guildcount}")){
      return;
    }
 
    client.user.setPresence({ activity: { name: `${status.toLowerCase().replace("{guildcount}",client.guilds.cache.size)}`, type: `WATCHING` }, status: 'dnd' })
  }, "300000")
}
client.on("ready", async () => {
    console.log("Sir Countalot is ready!")
   const status = await db.get("Status")
   if(status.toLowerCase().includes("{guildcount}")){

    client.user.setPresence({ activity: { name: `${status.toLowerCase().replace("{guildcount}",client.guilds.cache.size)}`, type: `WATCHING` }, status: 'dnd' })
      return UpdateGuilds(); 
   }
    client.user.setPresence({ activity: { name: status, type: `WATCHING` }, status: 'dnd' })
})
if(fs.existsSync('stats.json')){
    stats =  jsonfile.readFileSync("stats.json")
}
async function blacklist(message,args){
     let user
    if(message.mentions.members.first()){
       user = await client.users.fetch(message.mentions.members.first().toLocaleString().replace("<@","").replace(">","").replace("!",""))
     }else if(!message.mentions.members.first()){
       console.log(args[0])
       user = await client.users.fetch(args[0])
     }
     console.log(user.id)
     if(!user){
       return message.reply('Please specify a user or their id.')
     }
   const isblack = await db.get(`IsBlacklisted-${user.id}`)
   if(isblack !== null){
      db.delete(`IsBlacklisted-${user.id}`).then(() =>{
       return message.reply(`Successfully unblacklisted <@${user.id}>.`)
     })
   }else if(isblack == null){
     db.set(`IsBlacklisted-${user.id}`,true).then(() =>{
       return message.reply(`Sucessfully blacklisted <@${user.id}>`)
     })
   }
 }
const Topgg = require("@top-gg/sdk")
if(1 + 1 == 4){
  const ap = AutoPoster(process.env.toptoken, client) // your discord.js or eris client

}
  

const webhook = new Topgg.Webhook(process.env.webauth) 

server.post('/vote', webhook.middleware(), async (req, res) => {
  const user = await client.users.fetch(req.vote.user)
  if(!user){
    return console.log(`Cannot find user!`);
  }
    console.log(user.id + " just voted for Sir Countalot!")
    const embed = new Discord.MessageEmbed()
.setColor("RANDOM")
.setTitle("Thanks For Voting!")
.setDescription(`Thanks you for voting for Sir Countalot. You will have the "Voted" role in my support server, https://discord.gg/qyHnGP5yMP for 12 hours.`)
user.send(embed).catch(error => {
  console.log(`Error: ${error}`)
})
const guild = client.guilds.cache.find(g => g.id == "791760625243652127")
if(!guild){
  return console.log(`Cannot find guild!`);
}
const channel = guild.channels.cache.find(c => c.id == "793598695382843402")
if(!channel){
  return console.log(`Cannot find channel!`)
}
channel.send(`<@${user.id}> has voted for Sir Countalot!`)
const role = guild.roles.cache.find(r => r.id == "796439384940871701")
if(!role){
  return console.log(`Cannot find role!`)
}
const guildmember = guild.members.cache.find(m => m.id == user.id)
if(!guildmember){
  return console.log(`Cannot find guild member.`)
}
guildmember.roles.add(role,"Voted for Sir Countalot!")
setTimeout(() => {
  guildmember.roles.remove(role,"12 Hour voting period over.")
}, 43200000)
    return;
  })




client.on("message", async message => {   
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;
   
    let prefix = await GuildPrefix.findOne(({guildid: message.guild.id}))
    
    if(prefix == null){
let dbsave = new GuildPrefix({guildid: message.guild.id, prefix: "c!"})
dbsave.save()
      prefix = "c!"
    }
    if(!message.content.startsWith(prefix.prefix)) return;
    const args = message.content.slice(prefix.prefix.length).split(" ");
    const command = args.shift().toLowerCase();
    if(command == "ping"){    
        client.Commands.get('ping').execute(message,args,Discord,client)
    }else if(command == "vote"){
      console.log(`vote ${message.guild.id}`)
      console.log(`vote ${message.member.id}`)
      const embed = new Discord.MessageEmbed()
        .setTitle(`Voting`)
        .setDescription(`Click one of the link(s) below to vote!`)
        .addField("Top.gg", "[Click here.](https://top.gg/bot/791760755195904020/vote)")
        .setColor("RANDOM")
        .setTimestamp()
        message.channel.send(embed)
    }else if(command == "dblist"){
      if(message.member.id != "432345618028036097"){
        return message.delete();
      }
      const list = await db.getAll()
      
      message.reply(`Keys: ` + Object.keys(list).toString().replace(null,"null") + `.   Values: ` + Object.values(list).toString().replace(null,"null"))
    }else if(command == "eval") {
      if(message.member.id != "432345618028036097"){
  return message.delete();
}
   
      console.log("Eval")
    
      let code = message.content.split(" ").slice(1).join(" ")
     
      console.log(`Evaluate ${message.author.id}`)
      let evaluated
       
    try {
      evaluated = await eval(`(async () => {  ${code}})()`);
      console.log(evaluated)
      const embed = new Discord.MessageEmbed()
            .setTitle(`Evaluation`)
            .setDescription(`Evaluated in *${Date.now() - message.createdTimestamp + " ms"}.*`)
            .addField(`Input`,"```js\n" + code + "```")
            .addField(`Output`,"```js\n" + evaluated + "```")
            .setTimestamp()
             message.channel.send(`<@${message.author.id}>`,embed)
            
    } catch (e) {
      console.log(e)
          const embed = new Discord.MessageEmbed()
          .setTitle(`Evaluation`)
          .setDescription(`Error`)
          .addField(`Input`,"```js\n" + code + "```")
          .addField(`Error`,"```" + e + "```")
          .setTimestamp()
           message.channel.send(`<@${message.author.id}>`,embed)
    }
}else if(command == "botinfo"){
  client.Commands.get("botinfo").execute(message,args,client)
}else if(command == "serverinfo"){
      client.Commands.get(`serverinfo`).execute(message,args)
    }else if(command == "ms"){
       if(message.member.id != "432345618028036097"){
        return message.delete();
    }
      if(!args[0]){
        return message.reply("omg just give me a number")
      }
      const me = ms(args[0])
      console.log(me)
      message.reply(me)
    }else if(command == "listall"){
    if(message.member.id != "432345618028036097"){
        return message.delete();
    }
   
  }else if(command == "setnsfw"){
      if(message.member.id != "432345618028036097"){
        return message.delete();
    }
    let channel
    let cont = true
    if (message.mentions.channels.first()) {
      channel = await message.guild.channels.cache.find(r => r.id === message.mentions.channels.first().toLocaleString().replace("<#","").replace(">",""))
    } else {
      channel = await message.guild.channels.cache.find(
        r => r.id == args[0])
    }
    if (!channel) {
      message.reply("please run this command again but include a channel.");
      cont = false;
    }
    if (cont == false) {
      return;
    }
    console.log(channel.name);
    if(channel.nsfw == true){
      channel.setNSFW(false,"Changed by the froggo.")
      return message.reply("it's a shame you can't post anime thighs anymore")
    }else if(channel.nsfw == false){
      channel.setNSFW(true,"Changed by the froggo.")
      return message.reply("go post some anime thighs now.")
    }
    }else if(command == "curnum"){
      if(message.member.id != "432345618028036097"){
        return message.delete();
      }
      const curnum = await db.get(`Guild-${message.guild.id}-CountingNum`)
      console.log(curnum)
      message.reply(`Current number is ` + "`" + curnum + "`")
    }else if(command == "calc"){
        if(message.member.id != "432345618028036097"){
        return message.delete();
    }
        
        if(!args[0]){
          return message.reply('bro I want some numbers.')
        }
          let prob = message.content.split(" ").splice(1).join(" ")
        const ans = math.evaluate(prob)
        console.log(ans)
      message.reply(ans)
    }else if(command == "dm"){
       if(message.member.id != "432345618028036097"){
        return message.delete();
    }
    console.log(`dm ${message.author.id}`)
    console.log(`dm ${message.member.id}`)
      let mentionMember 
      if(message.mentions.members.first){
        mentionMember = message.mentions.members.first()
      }else{
          mentionMember = await client.users.cache.find(m => m.id == args[0])
      }
      if(!mentionMember){
        return message.reply(`I need a user to DM!`);
      }
      console.log(mentionMember.displayName)
      let dm = await db.get(`${mentionMember.id}-DMS`)
      if(dm == null){
        return message.reply(`This user has opted out of DMs.`)
      }
      let e = message.content.split(" ").splice(2).join(" ")
         
         if(!e){
           return message.reply(`Please give me something to tell them!`);
         }
        mentionMember.send(`New DM from <@${message.member.id}>. Message: ${e}. ***To OPT out of this, please DM me and react to the OPT OUT option.***`).catch(error => {
          console.log(`Guild ${message.guild.id} DM error: ${error}`)
          return message.channel.send(`Something went wrong! `  + "`" + `${error}` + "`");
        })
        return;
    }else if(command == "blacklist"){
    let user
    console.log('blacklist command sent')
    if(message.guild.id != "791760625243652127"){
      return message.delete();
    }
    if(!message.member.hasPermission('MANAGE_CHANNELS')){
      return message.delete();
    }
   blacklist(message,args)

    }else if(command == "database"){
        if(message.member.id != "432345618028036097"){
            return message.delete()
        }
        console.log('database command sent')
        if(!args[0]) return message.reply('whoops something went wrong!')
        if(args[0] === "See"){
          if(!args[1]) return message.reply('Please specify a key.')
          console.log(args[1])
     return run(args[1],message)
     
        } else if(args[0] === "Change"){
           if(!args[1]) return message.reply('Please specify a key.')
           console.log(args[1])
           let e = "";
        for (let i = 0; i < args.length; i++) {
       if(i >= 2){
            e = e + args[i] + " ";
       }
        }
        args[2] = e;
        console.log(args[2]);
           if(!args[2]) return message.reply('Please specify some data.')
           console.log(args[2])
         return setData(args[1],args[2],message)
        
        }else if(args[0] === "Remove"){
          if(!args[1]) return message.reply("Please specify a key!")
          console.log(args[1])
          return removeData(args[1],message)
        }
      
        
      }else if(command == "purge"){
          console.log(`purge ${message.guild.id}`)
          console.log(`purge ${message.member.id}`)
          let perm = false
          if(!message.member.hasPermission(`MANAGE_MESSAGES`)) return message.delete();
          const amount = args[0]
          const perms = message.member.permissionsIn(message.channel).toArray();
        perms.forEach(async function(item,index,array){
        
            if(item == `MANAGE_MESSAGES`){
                perm = true
                if (!amount) return message.reply('You haven\'t given an amount of messages which should be deleted!'); // Checks if the `amount` parameter is given
                if (isNaN(amount)) return message.reply('The amount parameter isn`t a number!'); // Checks if the `amount` parameter is a number. If not, the command throws an error
                
                if (amount > 100) return message.reply('You can`t delete more than 100 messages at once!'); // Checks if the `amount` integer is bigger than 100
                if (amount < 1) return message.reply('You have to delete at least 1 message!'); // Checks if the `amount` integer is smaller than 1
                await message.channel.messages.fetch({ limit: amount }).then(messages => { // Fetches the messages
                    message.channel.bulkDelete(messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
                )}).catch(error => {
                  console.log(`Error: ${error}`)
                }).then(() => message.channel.send(`Done!`).then(msg => {
                   msg.delete({ timeout: 5000 })

                }) )
                return;
              }
        }); if(perm == false){
            
            return message.delete();
        }
       
        return message.delete();
       
      }else if(command == "lock"){
         console.log('lock')
         client.Commands.get("lock").execute(message,args) 
      }else if(command == "unlock"){
        client.Commands.get("unlock").execute(message,args)
      }else if(command == "counting"){
          if(!message.member.hasPermission(`MANAGE_GUILD`)){
              return message.delete();
          }
          if(!args[0]){
              const pre = prefix.prefix
              return message.reply(`${pre}counting ON/OFF/SETTINGS `)
          }
          if(args[0].toLowerCase() == "off"){
            await CountingEnable.deleteMany(
   {
      guildid: message.guild.id
   })
              const ne = new CountingEnable({
        guildid: message.guild.id,
        enabled: false
      })
      ne.save()
                  return message.reply("Counting is now disabled in this guild.");
              
          }else if(args[0].toLowerCase() == "on"){
            await CountingEnable.deleteMany(
   {
      guildid: message.guild.id
   })
              const ne = new CountingEnable({
        guildid: message.guild.id,
        enabled: true
      })
      ne.save()
                  return message.reply(`Counting is now enabled in this guild.`)
              
          }else if(args[0].toLowerCase() == "settings"){
            const embed = new Discord.MessageEmbed()
            .setTitle(`Counting Settings`)
            .setColor("RANDOM")
            .setDescription("Please select one of the following:")
            .addFields(
              {name: "Channel", value: `Change the channel in which counting happens.`},
              {name: "Repeat", value: "Change whether or not users can count on their own. ON = Can repeat. OFF = Can't repeat."},
              {name: "Webhook", value: "Changes whether a webhook in place of a user is sent to prevent deleting/editing."}
            )
            message.channel.send(`<@${message.member.id}>`,embed)
            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
            collector.on("collect", async msg =>{
              console.log(msg.content)
              if(msg.content.toLowerCase() == "channel"){
                collector.stop("Answered.")
    
                message.reply("Please # a channel or enter it's id.")
                const collector2 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
                collector2.on("collect",async chan => {
                  collector2.stop("Answered")
               
                  let channel
                  let cont = true
                  if (chan.mentions.channels.first()) {
                    channel = await message.guild.channels.cache.find(r => r.id === chan.mentions.channels.first().toLocaleString().replace("<#","").replace(">",""))
                  } else {
                    channel = await chan.channel.guild.channels.cache.find(
                      r => r.id == chan.content
                    );
                  }
                  if (!channel) {
                    message.reply("please run this command again but include a channel.");
                    cont = false;
                  }
                  if (cont == false) {
                    return;
                  }
                  console.log(channel.name);
                  db.set(`Guild-${message.guild.id}-CountingChannel`,channel.id).then(() => {
                      db.set(`Guild-${message.guild.id}-CountingNum`,1)
                      message.reply(`Counting channel is now set to <#${channel.id}>. Start counting from 1.`)
                  })
                })
              }else if(msg.content.toLowerCase() == "repeat"){
                message.reply("Please chat ON or OFF.")
                const collector2 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
                collector2.on("collect",async mas => {
                  console.log(mas.content)
                  collector2.stop("Answered")
                  if(mas.content.toLowerCase() == "on"){
                    message.reply("Changing repeat to true...")
                    return db.set(`Guild-${message.guild.id}-Repeat`,true);
                  }else if(mas.content.toLowerCase() == "off"){
                    message.reply("Changing repeat to false.")
                    return db.set(`Guild-${message.guild.id}-Repeat`,false);
                  }else{
                    return message.reply("Please run this command again except tell me options.")
                  }
                })
              }else if(msg.content.toLowerCase() == "webhook"){
                message.reply("Please chat ON or OFF.")
                const collector3 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
                collector3.on("collect",async mas => {
                  console.log(mas.content)
                  collector3.stop("Answered")
                  if(mas.content.toLowerCase() == "on"){
                    message.reply("Changing webhook to true...")
                    return db.set(`Guild-${message.guild.id}-Webhook`,true);
                  }else if(mas.content.toLowerCase() == "off"){
                    message.reply("Changing webhook to false.")
                    return db.set(`Guild-${message.guild.id}-Webhook`,false);
                  }else{
                    return message.reply("Please run this command again except tell me options.")
                  }
                })
              }
            })
             
          }
      }else if(command == "commands"){
          console.log(`commands ${message.guild.id}`)
          console.log(`command ${message.member.id}`)
          const pre = prefix.prefix
          const embed = new Discord.MessageEmbed()
          .setTitle("Commands")
          .setColor("RANDOM")
          .addFields(
              {name: `${pre}ping`, value: `Shows the current message and API ping.`},
              {name: `${pre}prefix`, value: "Changes prefix of the guild. Must have `MANAGE_SERVER` permissions."},
              {name: `${pre}counting`,value: "Enables/Disables counting and other settings."},
              {name: `${pre}slowmode`,value: "Changes slowmode in current/specified channel. Requires `MANAGE_CHANNELS` in the guild and in the channel."},
              {name: `${pre}purge`, value: "Purges messages in current channel from up to 14 days (blame discord api). Requires `MANAGE_CHANNELS` in the guild and in the channel."},
              {name: `${pre}support`, value: "Gives support server link."},
              {name: `${pre}vote`, value: `Shows links to vote for MultiBot.`},
              {name: `${pre}help`,value: "Gives quick faqs."},
              {name: `${pre}invite`,value: "Shows invite of the bot."},
              {name: `${pre}reddit`, value: `Shows a reddit post from a random subreddit or a reddit of your choice. If channel is SFW all NSFW posts will be filtered. This command really sucks but it works.`},
              {name: `${pre}lock`, value: "Locks a specified channel with a reason. Must have `MANAGE_CHANNELS` permission in the guild and the channel."},
              {name: `${pre}unlock`, value: "Unlocks a specified channel with a reason. Must have `MANAGE_CHANNELS` permission in the guild and the channel."}
          )
          .setFooter("See a problem? Join our support server: https://discord.gg/qyHnGP5yMPt.")
          message.channel.send(embed)
      }else if(command == "status"){
          if(message.member.id != "432345618028036097"){
        return message.delete();
    }
          let status = ""
          let i;
           for (i = 0; i < args.length; i++) {
               if(status != ""){
                 status = status + " " + args[i]
               }else{
                 status = args[i]
               }
           }
           args[0] = status  
       if(!args[0]){
         return message.reply('I need a status buddy.')
       }  
       if(status.toLowerCase().includes("{guildcount}")){
         db.set("Status",status)
  
         client.user.setPresence({ activity: { name: `${status.toLowerCase().replace("{guildcount}",client.guilds.cache.size)}`, type: `WATCHING` }, status: 'dnd' })
       message.reply("go check it out");
       return UpdateGuilds();
       }
       db.set("Status",args[0])
       client.user.setPresence({ activity: { name: args[0], type: `WATCHING` }, status: 'dnd' })
       return message.reply("go check it out")
      }else if(command == "support"){
        return message.reply("Join https://discord.gg/qyHnGP5yMP for support!");
      }else if(command == "prefix"){
          if(!message.member.hasPermission(`MANAGE_GUILD`)){
              return message.delete();
          }
          console.log('prefix')
          if(!args[0]){
            return message.reply(`${prefix}prefix SEE/CHANGE/RESET PREFIX`);
          } 
          if(args[0].toLowerCase() == "see"){
              let pre = await GuildPrefix.findOne({guildid: message.guild.id})
              console.log(pre.prefix)
              return message.reply("Current prefix is `" + pre.prefix + "`");
          }else if(args[0].toLowerCase() == "change"){
              if(!args[1]){
                  return message.reply("please run this command again but include a prefix.");
              }
             await GuildPrefix.deleteMany(
   {
      guildid: message.guild.id
   }
)
             let dbsave = new GuildPrefix({guildid: message.guild.id, prefix: args[1]})
dbsave.save()
                  console.log(`Guild ${message.guild.id}'s prefix was changed to ${args[1]} by ${message.member.id}.`)
                  return message.reply("Prefix has been changed to `" + args[1] + "`");
            
          }else if(args[0].toLowerCase() == "reset"){
                  await GuildPrefix.deleteMany(
   {
      guildid: message.guild.id
   }
)
             let dbsave = new GuildPrefix({guildid: 
             message.guild.id, prefix: "c!"})
dbsave.save()
                console.log(`Guild ${message.guild.id}'s prefix was reset by ${message.member.id}.`)
                return message.reply("Prefix has been reset to `c!`");
              
          }
      }else if(command == "help"){
        const pre = prefix.prefix
          const embed = new Discord.MessageEmbed()
          .setTitle("I need help!")
          .setColor("RANDOM")
          .addFields(
              {name: "How do I setup counting? ", value: "To setup counting, make sure the bot has `MANAGE_MESSAGES` permissions in your channel and in the guild. Then, run **" + pre + "counting** to setup counting. Make sure your counting channel has a webhook added."},
              {name: "How do I change my prefix?",value: "If you have forgotten your prefix, do **@MultiBot prefix see** to view the prefix. If you want to change or reset your prefix, do **" + pre + "prefix change/reset** OR **@MultiBot prefix change/reset**."},
              {name: `Why do I need a webhook to count?`,value:`You need a webhook to prevent members from deleting/editing their message. You can disable this with the **${pre}counting** command.`},
              {name: `When I run a command, why does it delete my message?`, value: `You must have the required permission. Run ${pre}commands to see what permissions you need.`}

          )
          .setFooter("Still need help? Join our support server: https://discord.gg/qyHnGP5yMPt.")
          message.channel.send(embed)
      }else if(command == "guildcount"){
         if(message.member.id != "432345618028036097"){
        return message.delete();
    }
        let guildcount = client.guilds.cache.size
        message.channel.send(`MultiBot is in ${guildcount} guilds.`)
      }else if(command == "newnum"){
        if(message.member.id != "432345618028036097"){
            return message.delete()
        }
        if(!args[0]){
            return message.reply('give me numbo')
        }
        const num = args[0].replace(" ","")
        db.set(`Guild-${message.guild.id}-CountingNum`,Number(num)).then(() =>{
            message.reply("Done!")
        })
      
      }else if(command == "invite"){
      
      return message.channel.send("https://discord.com/oauth2/authorize?client_id=791760755195904020&scope=bot&permissions=125969");
    }
})

client.on("message",async message =>{
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;
   const mentionMember = message.mentions.members.first()
   if(!mentionMember){
     return;
   }
   if(!mentionMember.id == "791760755195904020"){
     return;
   }
    if(!message.content.startsWith("<@!791760755195904020>")) return;
    const dis = "<@!791760755195904020> "
    const args = message.content.slice(dis.length).split(" ");
      let pre = await GuildPrefix.findOne(({guildid: message.guild.id}))
    
    if(pre == null){
let dbsave = new GuildPrefix({guildid: message.guild.id, prefix: "c!"})
dbsave.save()
      prefix = "c!"
    }
    const command = args.shift().toLowerCase();
    if(command == "prefix"){
        if(!message.member.hasPermission(`MANAGE_GUILD`)){
            return message.delete();
        }
        return message.reply(`I'm sorry but this command is not in use. Your current guild prefix is **${pre.prefix}**.`);
        console.log('prefix')
        if(!args[0]){
          return message.reply(`<@791760755195904020> prefix SEE/CHANGE/RESET PREFIX`);
        } 
        if(args[0].toLowerCase() == "see"){
            const prefix = await db.get(`Guild-${message.guild.id}-Prefix`)
            return message.reply("Current prefix is `" + prefix + "`");
        }else if(args[0].toLowerCase() == "change"){
            if(!args[1]){
                return message.reply("please run this command again but include a prefix.");
            }
            db.set(`Guild-${message.guild.id}-Prefix`,args[1]).then(() => {
                console.log(`Guild ${message.guild.id}'s prefix was changed to ${args[1]} by ${message.member.id}.`)
                return message.reply("Prefix has been changed to `" + args[1] + "`");
            })
        }else if(args[0].toLowerCase() == "reset"){
            db.set(`Guild-${message.guild.id}-Prefix`,"c!").then(() => {
              console.log(`Guild ${message.guild.id}'s prefix was reset by ${message.member.id}.`)
              return message.reply("Prefix has been reset to `c!`");
            })
        }
    }
})
async function updatenumber(currentnum,guild){
  await db.set(`Guild-${guild}-CountingNum`,currentnum)
}
async function getnumber(guild){
    let currentnum = await db.get(`Guild-${guild}-CountingNum`)
    if(currentnum == null){
        currentnum = 1
    }
    return currentnum
  }
const numpins = require("./numbers")

function ispin(number){

    for (let i = 0; i < numpins.length; i++) {
    
        if(numpins[i] == number){
          console.lob(number)
            return true
        }
    }
    return false
}


client.on("message",async message =>{
   if(message.channel.type == "dm"){
        return;
    }
    const countingenabled = await CountingEnable.findOne({guildid: message.guild.id})
    if(countingenabled == null){
      const ne = new CountingEnable({
        guildid: message.guild.id,
        enabled: false
      })
      ne.save()
      return;
    }
    if(countingenabled.enabled == false){
      return;
    }
   
    if(message.author.bot){
        return;
    }
    if(message.channel.id != await db.get(`Guild-${message.guild.id}-CountingChannel`)){
        return;
    }
    let prevuser = await db.get(`Guild-${message.guild.id}-PrevUser`)
    let currentnum = await getnumber(message.guild.id)
    let webhook = await db.get(`Guild-${message.guild.id}-Webhook`)
    let repeat = await db.get(`Guild-${message.guild.id}-Repeat`)
    if(repeat == null){
      repeat = false
    }
    if(webhook == null){
      webhook = false
    }
    if(message.content != String(currentnum)){
      if(message.system){
        return;
      }
      if(message.member.id == "432345618028036097"){
        return;
      }
        if(!message.guild.me.hasPermission(`MANAGE_MESSAGES`)){
            console.log(`Guild ${message.guild.id} does not have correct perms for counting.`)
           return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_MESSAGES` permission enabled in this channel and under the role settings.");
        }
        console.log(`${message.member.id} didn't put correct number in guild ${message.guild.id}.`)
        message.delete().catch(console.error())
        return
    }
    if(repeat == false){
      if(prevuser == message.member.id){
        if(!message.guild.me.hasPermission(`MANAGE_MESSAGES`)){
          console.log(`Guild ${message.guild.id} does not have correct perms for counting.`)
         return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_MESSAGES` permission enabled in this channel and under the role settings.");
      }
      console.log(`${message.member.id} repeated in the guild ${message.guild.id}.`)
      return message.delete();
      }
    }
    if(message.content == String(currentnum)){
        if(!message.guild.me.hasPermission(`MANAGE_MESSAGES`)){
            console.log(`Guild ${message.guild.id} does not have correct perms for counting.`)
           return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_MESSAGES` permission enabled in this channel and under the role settings.");
        }
        
        db.set(`Guild-${message.guild.id}-PrevUser`,message.member.id)
        updatenumber(currentnum + 1,message.guild.id)
        console.log(`${message.member.id} counted correctly in guild ${message.guild.id}. Number is now ${String(currentnum + 1)}.`)
         if(ispin(currentnum)){
                    message.pin()
                }
        if(webhook == true){
          let webhooks = await message.channel.fetchWebhooks()
          let webhook = webhooks.first()
          if(!webhook){
           message.channel.createWebhook(`Counting Webhook`, {reason: `No counting webhook found. Created new one.`}).catch(error => {
             console.log(`Guild ${message.guild.id} Webhook Error: ${error}`)
             message.channel.send(`Something went wrong! `  + "`" + `${error}` + "`")
           })
          }
          webhooks = await message.channel.fetchWebhooks()
          webhook = webhooks.first();
           if(webhook){
            if(currentnum == 69){
              webhook.send(`${currentnum} nice bro 👌`, {
                username: message.member.displayName,
                avatarURL: message.member.user.avatarURL()
            }).then(msg => {
                
                return message.delete().catch(console.error());
            }).catch(error => {
              console.log(`Guild ${message.guild.id} Counting Error ${error}`)
            })
            }else if(currentnum == 420){
              
                webhook.send(`${currentnum} nice bro 👌`, {
                  username: message.member.displayName,
                  avatarURL: message.member.user.avatarURL()
              }).then(msg => {
                  
                  return message.delete().catch(console.error());
              }).catch(error => {
                console.log(`Guild ${message.guild.id} Counting Error ${error}`)
              })
              
            }else{
              webhook.send(currentnum, {
                username: message.member.displayName,
                avatarURL: message.member.user.avatarURL()
            }).then(msg => {
                if(ispin(currentnum)){
                    msg.pin()
                }
                
                return message.delete().catch(console.error());
            }).catch(error => {
              console.log(`Guild ${message.guild.id} Counting Error ${error}`)
            })
            }
               
           }
        }
      
    } 

   
})
client.login(process.env.token)
server.all('/', (req, res)=>{
  res.send('MultiBot is alive!')
})

  server.listen(3000, ()=>{console.log("Server is Ready!")});

