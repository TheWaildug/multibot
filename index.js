const Discord = require("discord.js")
const client = new Discord.Client()
const fs = require("fs")
const randomPing = require("./randomping.js")
const facts = require("./facts.js")
const quote = require("./quotes.js")
const ms = require("ms")
const Database = require("@replit/database")
const db = new Database()
client.Commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.Commands.set(command.name, command);
}
client.on("ready", async () => {
    console.log("The MultiBot is ready!")
    client.user.setStatus("dnd")
    client.user.setActivity("the frog.", {type: "WATCHING"}).catch(console.error);
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
    }else if(command == "database"){
        if(message.member.id != "432345618028036097"){
            return message.delete()
        }
        
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

function updatevc(guild,user,number){
    const uservc = guild.channels.cache.find(c => c.id == "793161994932060170")
    const numbervc = guild.channels.cache.find(c => c.id == "793161415828701215")
    if(uservc.type == "voice"){
        uservc.name == `Current Counter: ${user}.`
    }
    if(numbervc.type == "voice"){
        numbervc.name == `Current Number: ${number}.`
    }
}
client.on("message",async message =>{
  
    if(message.channel.type == "dm"){
        return;
    }
    if(message.author.bot){
        return;
    }
    if(!message.channel.id == "791760708164911124"){
        return
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
           return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_MESSAGES` permission enabled in this channel and under the role settings.")
        }
        updatevc(message.guild,message.member.displayName,currentnum + 1)
        if(ispin(currentnum)){
            message.pin()
        }
        updatenumber(currentnum + 1,message.guild.id)
        updateuser(message.member.id,message.guild.id)
        console.log(`${message.member.id} counted correctly. Number is now ${String(currentnum + 1)}.`)
        return;
    } 

   
})
client.login(process.env.token)
const wakeup = require("./server.js")  
wakeup() 
