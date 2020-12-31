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
const topgg = require("top.gg")
const math = require("mathjs")
const db = new Database()
client.Commands = new Discord.Collection();
var stats = {}
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
async function run(kay,message) {
    console.log('run function')
    const key = String.raw(kay)
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
client.on("ready", async () => {
    console.log("The MultiBot is ready!")
   
    client.user.setActivity("a new avatar.", {type: `LISTENING`}, {status: "dnd"}).catch(console.error);
    
})
if(fs.existsSync('stats.json')){
    stats =  jsonfile.readFileSync("stats.json")
}
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
    const xpToNextLevel = 5 * Math.pow(userStats.level, 2) * 50 * userStats.level + 100;
    console.log(`${message.author.id} now has ${userStats.xp} xp. ${xpToNextLevel - userStats.xp} xp needed for next level.`)
     userStats.xpToNextLevel = xpToNextLevel
       if(userStats.xp >= xpToNextLevel){
       userStats.level++;
       userStats.xp = userStats.xp - xpToNextLevel;
       console.log(`${message.author.id} has leveled up to ${userStats.level}.`)
       message.channel.send(`<@${message.member.id}> has leveled up to ${userStats.level}!`)
   }
   jsonfile.writeFileSync("stats.json",stats);
    
    
 
 }

})
client.on("message",async message =>{
    if(message.author.bot) return;
    if(message.channel.type == "dm"){
        console.log(`New DM to MultiBot from ${message.author.id}. Message: ${message.content}.`)
      const lastmsg = await db.get(`${message.author.id}-LastDm`)
      console.log(Date.now() - Number(lastmsg))
      if(Date.now() - Number(lastmsg) > 300000){
        const embed = new Discord.MessageEmbed()
        .setTitle("ModMail")
        .setColor("RANDOM")
        .setDescription(`You have activated ModMail. Please react to the emoji that corresponds to your reason.`)
        .addFields(
            {name: `📣`,value: `Make a suggestion for the bot.`},
            {name: `⚒️`,value: `Coming soon...`},
            {name: `:x:`,value: `Cancel.`}
        )
        message.channel.send(embed).then(msg => {
            msg.react("📣"),
            msg.react("⚒️"),
            msg.react("❌")
            db.set(`${message.author.id}-LastDm`,String(Date.now()))
        })
      
      
        
      }
   
    }
})
client.on("message", async message => {   
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;
   
    var prefix = await db.get(`Guild-${message.guild.id}-Prefix`)
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
    } else if(command == "calc"){
        if(!message.member.id == "432345618028036097"){
            return message.delete()
        }
        var prob = ""
        if(!args[0]){
          return message.reply('bro I want some numbers.')
        }
           var i;
        for (i = 0; i < args.length; i++) {
            if(prob != ""){
              prob = prob + " " + args[i]
            }else{
              prob = args[i]
            }
          
        }const ans = math.evaluate(prob)
        console.log(ans)
      message.reply(ans)
    }else if(command == "rank"){
        console.log('rank')
        const guildStats = stats[message.guild.id]
        const userStats = guildStats[message.author.id]
        message.channel.send(`Your current rank is **${userStats.level}.** You need **${(userStats.xpToNextLevel - userStats.xp)}** more xp to level up.`)
    }else if(command == "setlevel"){
        if(!message.member.id == "432345618028036097"){
            return message.delete();
        }
        if(!args[0]){
            return message.reply("I need a user id or mentioned member.");
        }
      var mentionMember 
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
        const xpToNextLevel = 5 * Math.pow(level, 2) * 50 * level + 100;
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
           var e = "";
        for (var i = 0; i < args.length; i++) {
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
          var perm = false
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
                )}).catch(console.error).then(() => message.channel.send(`Done!`).then(msg => {
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
              const pre =await db.get(`Guild-${message.guild.id}-Prefix`)
              return message.reply(`${pre}counting ON/OFF/CHANNEL #CHANNEL/ID`)
          }
          if(args[0].toLowerCase() == "off"){
              db.set(`Guild-${message.guild.id}-Counting`,false).then(() => {
                  
                  return message.reply("Counting is now disabled in this guild.");
              })
          }else if(args[0].toLowerCase() == "on"){
              db.set(`Guild-${message.guild.id}-Counting`,true).then(() => {
                  return message.reply(`Counting is now enabled in this guild.`)
              })
          }else if(args[0].toLowerCase() == "channel"){
            var channel, mentionchannel;
            var cont = true;
            if (message.mentions.channels.first()) {
              channel = mentionchannel = message.mentions.channels.first()
            } else {
              channel = mentionchannel = message.channel.guild.channels.cache.find(
                r => r.id === args[1]
              );
            }
            if (!channel && mentionchannel) {
              message.reply("please # a channel or enter its ID .");
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
          }
      }else if(command == "commands"){
          console.log(`commands ${message.guild.id}`)
          console.log(`command ${message.member.id}`)
          const pre = await db.get(`Guild-${message.guild.id}-Prefix`)
          const embed = new Discord.MessageEmbed()
          .setTitle("Commands")
          .setColor("RANDOM")
          .setURL("https://discord.gg/qyHnGP5yMP")
          .addFields(
              {name: `${pre}ping`, value: `Shows the current ping along with a random fact or quote.`},
              {name: `${pre}prefix`, value: "Changes prefix of the guild. Must have `MANAGE_SERVER` permissions."},
              {name: `${pre}counting`,value: "Enables/Disables counting and changes counting channel."},
              {name: `${pre}slowmode`,value: "Changes slowmode in current/specified channel. Requires `MANAGE_MESSAGES` in the guild and in the channel."},
              {name: `${pre}purge`, value: "Purges messages in current channel from up to 14 days (blame discord api). Requires `MANAGE_MESSAGES` in the guild and in the channel."},
              {name: `${pre}support`, value: "Gives support server link."},
              {name: `${pre}help`,value: "Gives quick faqs."},
              {name: `${pre}invite`,value: "Shows invite of the bot."},
              {name: `${pre}lock`, value: "Locks a specified channel with a reason. Must have `MANAGE_MESSAGES` permission in the guild and the channel."},
              {name: `${pre}unlock`, value: "Unlocks a specified channel with a reason. Must have `MANAGE_MESSAGES` permission in the guild and the channel."}
          )
          .setFooter("See a problem? Click the title to join our support server.")
          message.channel.send(embed)
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
      }else if(command == "ban"){

      }else if(command == "help"){
          const embed = new Discord.MessageEmbed()
          .setTitle("I need help!")
          .setColor("RANDOM")
          .setURL("https://discord.gg/qyHnGP5yMP")
          .addFields(
              {name: "How do I setup counting? ", value: "To setup counting, make sure the bot has `MANAGE_MESSAGES` permissions in your channel and in the guild. Then, run **" + prefix + "counting** to setup counting. Make sure your counting channel has a webhook added."},
              {name: "How do I change my prefix?",value: "If you have forgotten your prefix, do **@MultiBot prefix see** to view the prefix. If you want to change or reset your prefix, do **" + prefix + "prefix change/reset** OR **@MultiBot prefix change/reset**."},
              {nane: `Why do I need a webhook to count?`,value:`You need a webhook to prevent members from deleting their messages.`}

          )
          .setFooter("Still need help? Click the title above to join our support server!")
          message.channel.send(embed)
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
    var currentnum = await db.get(`Guild-${guild}-CountingNum`)
    if(currentnum == null){
        currentnum = 1
    }
    return currentnum
  }


const numpins = require("./numbers")

function ispin(number){
    for (var i = 0; i < numpins.length; i++) {
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
    var currentnum = await getnumber(message.guild.id)
   
    if(message.content != String(currentnum)){
        if(!message.guild.me.hasPermission(`MANAGE_MESSAGES`)){
            console.log(`Guild ${message.guild.id} does not have correct perms for counting.`)
           return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_MESSAGES` permission enabled in this channel and under the role settings.");
        }
        console.log(`${message.member.id} didn't put correct number in guild ${message.guild.id}.`)
        message.delete()
        return
    }
    if(message.content == String(currentnum)){
        if(!message.guild.me.hasPermission(`MANAGE_MESSAGES`)){
            console.log(`Guild ${message.guild.id} does not have correct perms for counting.`)
           return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_MESSAGES` permission enabled in this channel and under the role settings.");
        }
        
       
        updatenumber(currentnum + 1,message.guild.id)
        console.log(`${message.member.id} counted correctly in guild ${message.guild.id}. Number is now ${String(currentnum + 1)}.`)
        const webhooks = await message.channel.fetchWebhooks()
       const webhook = webhooks.first()
        if(webhook){
            webhook.send(currentnum, {
                username: message.member.displayName,
                avatarURL: message.member.user.avatarURL()
            }).then(msg => {
                if(ispin(currentnum)){
                    msg.pin()
                }
            })
        }
      

        return message.delete()
    } 

   
})
client.login(process.env.token)
const wakeup = require("./server.js")  
wakeup() 
