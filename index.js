const Discord = require("discord.js")
const client = new Discord.Client()
const fs = require("fs")    
const randomPing = require("./randomping.js")
const facts = require("./facts.js")
const quote = require("./quotes.js")
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
    if(status != "GuildCount"){
      return;
    }
    let guildcount = client.guilds.cache.size
    client.user.setPresence({ activity: { name: `${guildcount} guilds.`, type: `WATCHING` }, status: 'dnd' });
  }, "300000")
}
client.on("ready", async () => {
    console.log("The MultiBot is ready!")
   const status = await db.get("Status")
   if(status == "GuildCount"){
    let guildcount = 0
    client.guilds.cache.forEach(() => {
      guildcount = guildcount + 1
    })
    client.user.setPresence({ activity: { name: `${guildcount} guilds.`, type: `WATCHING` }, status: 'dnd' });
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
 const Topgg = require('@top-gg/sdk')

const api = new Topgg.Api(process.env.toptoken)
setInterval(() => {
  api.postStats({
    serverCount: client.guilds.cache.size
  })
}, 300000)
const webhook = new Topgg.Webhook(process.env.webauth) 
server.post("/servervote", webhook.middleware(), async (req, res) => {
  const user = await client.users.fetch(req.vote.user)
  if(!user){
    return console.log(`Cannot find user!`)
  }
  console.log(`${user.id} has voted for the support server!`)
  const embed = new Discord.MessageEmbed()
  .setColor("RANDOM")
  .setTitle("Thanks For Voting!")
  .setDescription(`Thanks you for voting for my support server! You will have the "Voted" role in the support server, https://discord.gg/qyHnGP5yMP for 12 hours.`)
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
  channel.send(`<@${user.id}> has voted for the server!`)
  const role = guild.roles.cache.find(r => r.id == "796439384940871701")
  if(!role){
    return console.log(`Cannot find role!`)
  }
  const guildmember = guild.members.cache.find(m => m.id == user.id)
  if(!guildmember){
    return console.log(`Cannot find guild member.`)
  }
  guildmember.roles.add(role,"Voted for the server!")
  setTimeout(() => {
    guildmember.roles.remove(role,"12 Hour voting period over.")
  }, 43200000)
      return;
})
server.post('/multibotvote', webhook.middleware(), async (req, res) => {
  const user = await client.users.fetch(req.vote.user)
  if(!user){
    return console.log(`Cannot find user!`);
  }
    console.log(user.id + " just voted for MultiBot!")
    const embed = new Discord.MessageEmbed()
.setColor("RANDOM")
.setTitle("Thanks For Voting!")
.setDescription(`Thanks you for voting for MultiBot. You will have the "Voted" role in my support server, https://discord.gg/qyHnGP5yMP for 12 hours.`)
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
channel.send(`<@${user.id}> has voted for MultiBot!`)
const role = guild.roles.cache.find(r => r.id == "796439384940871701")
if(!role){
  return console.log(`Cannot find role!`)
}
const guildmember = guild.members.cache.find(m => m.id == user.id)
if(!guildmember){
  return console.log(`Cannot find guild member.`)
}
guildmember.roles.add(role,"Voted for MultiBot!")
setTimeout(() => {
  guildmember.roles.remove(role,"12 Hour voting period over.")
}, 43200000)
    return;
  })


client.on("message",async message => {
   if(message.channel.type == "dm"){
        return;
    }
    if(message.guild.id != "791760625243652127"){
        return;
    }
    if(message.author.bot){
        return;
    }
   
 if(message.guild.id in stats == false){
     stats[message.guild.id] = {};

 }
 const guildStats = stats[message.guild.id]
 if(message.author.id in guildStats == false){
     guildStats[message.author.id] = {
        xp: 0,
        level: 0,
        last_message: 0,
        xpToNextLevel: 0
     }
 }
 const userStats = guildStats[message.author.id]
 if(Date.now() - userStats.last_message > 30000){
    userStats.xp += getRandomIntInclusive(25,50);
    userStats.last_message = Date.now();
    const xpToNextLevel = 5 * (userStats.level ^ 2) + 50 * userStats.level + 100
    
     userStats.xpToNextLevel = xpToNextLevel
       if(userStats.xp >= xpToNextLevel){
       userStats.level++;
       userStats.xp = userStats.xp - xpToNextLevel;
       console.log(`${message.author.id} has leveled up to ${userStats.level}.`)
       message.channel.send(`<@${message.member.id}> has leveled up to ${userStats.level}!`)
       userStats.xpToNextLevel = 5 * (userStats.level ^ 2) + 50 * userStats.level + 100
   }
   console.log(`${message.author.id} now has ${userStats.xp} xp. ${xpToNextLevel - userStats.xp} xp needed for next level.`)
   jsonfile.writeFileSync("stats.json",stats);
    
    
 
 }

})
//ModMail
client.on("message",async message =>{
    if(message.author.bot) return;
    if(message.channel.type == "dm"){
        console.log(`New DM to MultiBot from ${message.author.id}. Message: ${message.content}.`)
      let lastmsg = await db.get(`LastDm-${message.author.id}`)
      if(lastmsg == null){
          lastmsg = Date.now() + -210070
      }
      console.log(Date.now() - Number(lastmsg))
      console.log((Date.now() - Number(lastmsg)) / 60000)
      if(Date.now() - Number(lastmsg) > 210000){
        const embed = new Discord.MessageEmbed()
        .setTitle("ModMail")
        .setColor("00FF00")
        .setDescription(`You have activated ModMail. Please react to the emoji that corresponds to your reason.`)
        .addFields(
            {name: `📣`,value: `Make a suggestion for the bot.`},
            {name: `⚒️`,value: `Contact Staff (Coming soon...)`},
            {name: `✉️`, value: `Opt in/out of DMs from people.`},
            {name: `:x:`,value: `Cancel.`}
        )
        .setFooter(`This message will be invalid in 30 seconds.`)
      
        message.channel.send(embed).then(msg => {
          
            msg.react("📣"),
            msg.react("⚒️"),
            msg.react("✉️"),
            msg.react("❌"),
            db.set(`LastDm-${message.author.id}`,String(Date.now()))
    
        const filter = (reaction, user) => {
            return (reaction.emoji.name == "📣" || reaction.emoji.name == "✉️" || reaction.emoji.name == "⚒️" || reaction.emoji.name == "❌") && user.id === message.author.id;
        };
 let on = true      
const collector = msg.createReactionCollector(filter, { time: 30000 });
collector.on('collect', (reaction, user) => {
    console.log(`Collected ${reaction.emoji.name}`)
            if(reaction.emoji.name == "❌"){
                collector.stop("Cancelled by user.")
                    message.reply("Cancelling...")  
                    const embed = new Discord.MessageEmbed()
            .setTitle("ModMail")
            .setColor("00FF00")
            .setDescription(`This message is now invalid`)
            .setFooter(`You reacted to ❌.`)
            msg.edit(embed)
               return on = false;
        }else if(reaction.emoji.name == "✉️"){
          collector.stop("Reaction to ✉️.")
          const embed = new Discord.MessageEmbed()
          .setTitle("ModMail")
          .setColor("00FF00")
          .setDescription(`This message is now invalid`)
          .setFooter(`You reacted to ✉️.`)
          msg.edit(embed)
          message.reply(`Please reply with **In** or **Out**.`)
          const collector2 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 30000 });
          collector2.on("collect", massage => {
            if(massage.content.toLowerCase() == "in"){
              collector2.stop("Opting in.")
              message.reply(`You have opted in to DMs from people.`)
              on = false
              return db.set(`${message.author.id}-DMS`,true);
            }else if(massage.content.toLowerCase() == "out"){
              collector2.stop(`Opting out.`)
              message.reply(`You have opted out of DMs from people.`)
              on = false
              return db.delete(`${message.author.id}-DMS`);
            }
            setTimeout(async function(){
              if(on == false){
                return;
              }
              collector2.stop('Timeout')
                  
                message.reply(`Cancelling because you were inactve for 30 seconds.`)
              },30000)
          })
        }else if(reaction.emoji.name == "📣"){
            collector.stop("Reaction to 📣.")
                         
                    const embed = new Discord.MessageEmbed()
            .setTitle("ModMail")
            .setColor("00FF00")
            .setDescription(`This message is now invalid`)
            .setFooter(`You reacted to 📣.`)
            msg.edit(embed)
            on = false
               return makesuggestion(message,db,client)
        }
        setTimeout(async function(){
            collector.stop('Timeout')
              
                if(on == false){
                    return on = true;
                }
              
                 const embed = new Discord.MessageEmbed()
             .setTitle("ModMail")
             .setColor("00FF00")
             .setDescription(`This message is now invalid`)
             .setFooter(`This message was cancelled because you were inactive for 30 seconds.`)
             msg.edit(embed)
             message.channel.send(`No response after 30 seconds. Cancelled`)
            },30000)
    })      
})
      }
    }
})
client.on("message", async message => {   
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;
   
    let prefix = await db.get(`Guild-${message.guild.id}-Prefix`)
    if(prefix == null){
      db.set(`Guild-${message.guild.id}-Prefix`,"c!")
      prefix = "c!"
    }
    if(!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();
    if(command == "ping"){    
        client.Commands.get('ping').execute(message,args,Discord,facts,quote,randomPing)
    }else if(command == "slowmode"){
        client.Commands.get("slowmode").execute(message,args,ms)
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
    }else if(command == "eval") {
      if(!message.author.id == "432345618028036097") return message.delete();
      let result = message.content.split(" ").slice(1).join(" ")
          let evaled = eval(result);
          const embed = new Discord.MessageEmbed()
          .setTitle(`Evaluation`)
          .setDescription(`Evaluated in *${Date.now() - message.createdTimestamp + " ms"}.*`)
          .addField(`Input`,"```" + result + "```")
          .addField(`Output`,"```" + evaled + "```")
          .setTimestamp()
          message.channel.send(`<@${message.member.id}>`,embed)
          }else if(command == "serverinfo"){
      client.Commands.get(`serverinfo`).execute(message,args)
    }else if(command == "ms"){
      if(!message.member.id == "432345618028036097"){
        return message.delete();
      }
      if(!args[0]){
        return message.reply("omg just give me a number")
      }
      const me = ms(args[0])
      console.log(me)
      message.reply(me)
    }else if(command == "reddit"){
      console.log(`reddit ${message.guild.id}`)
      console.log(`redit ${message.member.id}`)
      if(args[0]){
        let reddit = args[0].replace("r/","")
        redditFetch({

          subreddit: reddit,
          sort: 'hot',
          allowNSFW: message.channel.nsfw,
          allowModPost: false,
          allowCrossPost: false,
          allowVideo: false
      
      }).then(post => {
        console.log(post.url)
      
            const embed = new Discord.MessageEmbed()
        .setTitle(`${post.title} in r/${post.subreddit} by u/${post.author_fullname}`)
        .setURL(`https://reddit.com${post.permalink}`)
        .setDescription(`${prefix}reddit`)
        .setColor("RANDOM")
        .attachFiles(post.url)
        .setTimestamp()
       
          return message.channel.send(embed);

      }).catch(error => {
        console.warn("Error: " + error)
        return message.reply("Something went wrong: `" + error + "`")
       
        })
      }else{redditFetch({
  
          subreddit: 'all',
          sort: 'hot',
          allowNSFW: message.channel.nsfw,
          allowModPost: false,
          allowCrossPost: false,
          allowVideo: false
      
      }).then(post => {
        console.log(post.url)
        
            const embed = new Discord.MessageEmbed()
        .setTitle(`${post.title} in r/${post.subreddit} by u/${post.author_fullname}`)
        .setURL(`https://reddit.com${post.permalink}`)
        .setDescription(`${prefix}reddit`)
        .setColor("RANDOM")
        .attachFiles(post.url)
        .setTimestamp()
       
          return message.channel.send(embed);
       
      }).catch(error => {
        console.warn("Error: " + error)
        return message.reply("Something went wrong: `" + error + "`")
       
        })
      }
  }else if(command == "setnsfw"){
      if(!message.member.id == "432345618028036097"){
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
    }else if(command == "calc"){
        if(!message.member.id == "432345618028036097"){
            return message.delete();
        }
        let prob = ""
        if(!args[0]){
          return message.reply('bro I want some numbers.')
        }
           let i;
        for (i = 0; i < args.length; i++) {
            if(prob != ""){
              prob = prob + " " + args[i]
            }else{
              prob = args[i]
            }
          
        }const ans = math.evaluate(prob)
        console.log(ans)
      message.reply(ans)
    }else if(command == "dm"){
      if(!message.member.id == "432345618028036097"){
        return message.delete();
      }
      let mentionMember 
      if(message.mentions.members.first){
        mentionMember = message.mentions.members.first()
      }else{
          mentionMember = await client.users.cache.find(m => m.id == args[0]).catch(error =>{
             return console.erro(`Error ${error}`)
          })
         
      }
      console.log(mentionMember.displayName)
      let dm = await db.get(`${mentionMember.id}-DMS`)
      if(dm == null){
        return message.reply(`This user has opted out of DMs.`)
      }
      let e = ""
      for (let i = 0; i < args.length; i++) {
        if(i >= 1){
             e = e + args[i] + " ";
        }
         }
         if(args[0] == ""){
           return message.reply("give me something to tell them")
         }
        mentionMember.send(`New DM from <@${message.member.id}>. Message: ${e}. ***To OPT out of this, please DM me and react to the OPT OUT option.***`).catch(error => {
          console.log(`Guild ${message.guild.id} DM error: ${error}`)
          return message.channel.send(`Something went wrong! `  + "`" + `${error}` + "`");
        })
        return;
    }else if(command == "rank"){
        console.log(`rank ${message.guild.id}`)
        console.log(`rank ${message.member.id}`)
        
        const guildStats = stats[message.guild.id]
        let userStats
        if(!message.mentions.members.first()){
          userStats = guildStats[message.author.id]
          return message.channel.send(`Your current rank is **${userStats.level}.** You need **${(userStats.xpToNextLevel - userStats.xp)}** more xp to level up.`);
        
          
        }else{
          const mm = message.mentions.members.first()
          userStats = guildStats[mm.id]
          return message.channel.send(`<@${mm.id}>'s current rank is **${userStats.level}.** They need **${(userStats.xpToNextLevel - userStats.xp)}** more xp to level up.`);        }

        
        
    }else if(command == "blacklist"){
    let user
    console.log('blacklist command sent')
    if(!message.guild.id == "791760625243652127"){
      return message.delete();
    }
    if(!message.member.hasPermission('MANAGE_CHANNELS')){
      return message.delete();
    }
   blacklist(message,args)
  }else if(command == "setlevel"){
        if(!message.member.id == "432345618028036097"){
            return message.delete();
        }
        if(!args[0]){
            return message.reply("I need a user id or mentioned member.");
        }
      let mentionMember 
      if(message.mentions.members.first){
        mentionMember = message.mentions.members.first().id
      }else{
          mentionMember = await message.guild.members.cache.find(m => m.id == args[0]).catch(error =>{
             return console.erro(`${message.guild.id} rank error: ${error}`)
          })
          console.log(mentionMember.displayName)
          mentionMember = mentionMember.id
      }
      const guildStats = stats[message.guild.id]
      if(message.author.id in guildStats == false){
        guildStats[message.author.id] = {
           xp: 0,
           level: 0,
           last_message: 0,
           xpToNextLevel: 0
        }
    }
        const userStats = guildStats[mentionMember]
        if(!args[1]){
            return message.reply("I need a level idiot.")
        }
        const level = args[1]
        const xpToNextLevel = 5 * (level ^ 2) + 50 * level + 100
        userStats.level = level
        userStats.xp = 0
     userStats.xpToNextLevel = xpToNextLevel
     message.reply(`Successfully leveled <@${mentionMember}> to ${level}`)
   jsonfile.writeFileSync("stats.json",stats);
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
              const pre = prefix
              return message.reply(`${pre}counting ON/OFF/SETTINGS `)
          }
          if(args[0].toLowerCase() == "off"){
              db.set(`Guild-${message.guild.id}-Counting`,false).then(() => {
                  
                  return message.reply("Counting is now disabled in this guild.");
              })
          }else if(args[0].toLowerCase() == "on"){
              db.set(`Guild-${message.guild.id}-Counting`,true).then(() => {
                  return message.reply(`Counting is now enabled in this guild.`)
              })
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
          const pre = prefix
          const embed = new Discord.MessageEmbed()
          .setTitle("Commands")
          .setColor("RANDOM")
          .addFields(
              {name: `${pre}ping`, value: `Shows the current ping along with a random fact or quote.`},
              {name: `${pre}prefix`, value: "Changes prefix of the guild. Must have `MANAGE_SERVER` permissions."},
              {name: `${pre}counting`,value: "Enables/Disables counting and other settings."},
              {name: `${pre}slowmode`,value: "Changes slowmode in current/specified channel. Requires `MANAGE_CHANNELS` in the guild and in the channel."},
              {name: `${pre}purge`, value: "Purges messages in current channel from up to 14 days (blame discord api). Requires `MANAGE_CHANNELS` in the guild and in the channel."},
              {name: `${pre}support`, value: "Gives support server link."},
              {name: `${pre}vote`, value: `Shows links to vote for MultiBot.`},
              {name: `${pre}help`,value: "Gives quick faqs."},
              {name: `${pre}invite`,value: "Shows invite of the bot."},
              {name: `${pre}reddit`, value: `Shows a reddit post from a random subreddit or a reddit of your choice. If channel is SFW all NSFW posts will be filtered.`},
              {name: `${pre}lock`, value: "Locks a specified channel with a reason. Must have `MANAGE_CHANNELS` permission in the guild and the channel."},
              {name: `${pre}unlock`, value: "Unlocks a specified channel with a reason. Must have `MANAGE_CHANNELS` permission in the guild and the channel."}
          )
          .setFooter("See a problem? Join our support server: https://discord.gg/qyHnGP5yMPt.")
          message.channel.send(embed)
      }else if(command == "status"){
          if(!message.member.id == "432345618028036097"){
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
       if(status == "guilds"){
         db.set("Status","GuildCount")
         let guildcount = client.guilds.cache.size
         client.user.setPresence({ activity: { name: `${guildcount} guilds.`, type: `WATCHING` }, status: 'dnd' })
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
      }else if(command == "help"){
          const embed = new Discord.MessageEmbed()
          .setTitle("I need help!")
          .setColor("RANDOM")
          .addFields(
              {name: "How do I setup counting? ", value: "To setup counting, make sure the bot has `MANAGE_MESSAGES` permissions in your channel and in the guild. Then, run **" + prefix + "counting** to setup counting. Make sure your counting channel has a webhook added."},
              {name: "How do I change my prefix?",value: "If you have forgotten your prefix, do **@MultiBot prefix see** to view the prefix. If you want to change or reset your prefix, do **" + prefix + "prefix change/reset** OR **@MultiBot prefix change/reset**."},
              {name: `Why do I need a webhook to count?`,value:`You need a webhook to prevent members from deleting/editing their message. You can disable this with the **${prefix}counting** command.`},
              {name: `When I run a command, why does it delete my message?`, value: `You must have the required permission. Run ${prefix}commands to see what permissions you need.`}

          )
          .setFooter("Still need help? Join our support server: https://discord.gg/qyHnGP5yMPt.")
          message.channel.send(embed)
      }else if(command == "guildcount"){
        if(!message.member.id == '432345618028036097'){
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
    const command = args.shift().toLowerCase();
    if(command == "prefix"){
        if(!message.member.hasPermission(`MANAGE_GUILD`)){
            return message.delete();
        }
        console.log('prefix')
        if(!args[0]){
          return message.reply(`@MultiBot prefix SEE/CHANGE/RESET PREFIX`);
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
            return true
        }
    }
    return false
}


client.on("message",async message =>{
   if(message.channel.type == "dm"){
        return;
    }
    if(await db.get(`Guild-${message.guild.id}-Counting`) == false){
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

