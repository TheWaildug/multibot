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
async function run(key,message) {
    console.log('run function')
    const data = await getData(key);
    console.log('' + data); // will print your data
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
   
    client.user.setActivity("the frog.", {type: "WATCHING"}, {status: "dnd"}).catch(console.error);
    
})
if(fs.existsSync('stats.json')){
    stats =  jsonfile.readFileSync("stats.json")
}
client.on("message",async message => {
    if(message.author.bot){
        return;
    }
    if(message.channel.type == "dm"){
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
    console.log(`${message.author.id} now has ${userStats.xp} xp. ${xpToNextLevel} xp needed for next level.`)
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
client.on("message", async message => {   
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;
   
    const prefix = "c!"
    if(!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();
    if(command == "ping"){    
        client.Commands.get('ping').execute(message,args,Discord,facts,quote,randomPing)
    }else if(command == "slowmode"){
        client.Commands.get("slowmode").execute(message,args,ms)
    }else if(command == "rank"){
        console.log('rank')
        const guildStats = stats[message.guild.id]
        const userStats = guildStats[message.author.id]
        message.channel.send(`Your current rank is **${userStats.level}.** You need **${(userStats.xpToNextLevel - userStats.xp)}** more xp to level up.`)
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
                )}).catch(console.error).then(() => message.channel.send(`Done!`))
                return perm = false;
            }
        }); if(perm == false){
            
            return message.delete();
        }
       
        return message.delete();
       
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
      if(message.member.id != "432345618028036097"){
          return message.delete()
      }
      message.channel.send("https://discord.com/oauth2/authorize?client_id=791760755195904020&scope=bot&permissions=8")
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
async function updateuser(user,guild){
    await db.set(`Guild-${guild}-CountingUser`,user)
}
async function finduser(guild){
    var currentuser = await db.get(`Guild-${guild}-CountingUser`)
    if(currentuser == null){
        currentuser = 0
    }
    return currentuser
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
    if(await db.get(`Guild-${message.guild.id}-Counting`) == true){
        return;
    }
    if(message.channel.type == "dm"){
        return;
    }
    if(message.author.bot){
        return;
    }
    if(message.channel.id != "791760708164911124"){
        return;
    }
    var currentnum = await getnumber(message.guild.id)
    var prevuser = await finduser(message.guild.id)
    if(prevuser == message.member.id){
        console.log(`${message.member.id} counted twice in a row.`)
        message.delete()
        return
    }
    if(message.content != String(currentnum)){
        console.log(`${message.member.id} didn't put correct number.`)
        message.delete()
        return
    }
    if(message.content == String(currentnum)){
        if(!message.guild.me.hasPermission(`MANAGE_MESSAGES`)){
           return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_MESSAGES` permission enabled in this channel and under the role settings.");
        }
        
       
        updatenumber(currentnum + 1,message.guild.id)
        updateuser(message.member.id,message.guild.id)
        console.log(`${message.member.id} counted correctly. Number is now ${String(currentnum + 1)}.`)
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
