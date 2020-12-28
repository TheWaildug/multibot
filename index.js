const Discord = require("discord.js")
const client = new Discord.Client()
const fs = require("fs")
const randomPing = require("./randomping.js")
const facts = require("./facts.js")
const quote = require("./quotes.js")
const ms = require("ms")
const fetch = require("node-fetch")
const Database = require("@replit/database")
const db = new Database()
client.Commands = new Discord.Collection();
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
   
    client.user.setActivity("the frog.", {type: "WATCHING"}).catch(console.error);
    client.user.setStatus("dnd")
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
      
        
      }else if(command == "newnum"){
        if(message.member.id != "432345618028036097"){
            return message.delete()
        }
        const num = args[0].replace(" ","")
        db.set(`Guild-${message.guild.id}-CountingNum`,num).then(() =>{
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

function updatevc(guild,user,number){
    console.log('update vc')
    console.log(guild.id)
    console.log(user)
    console.log(number)
    const uservc = guild.channels.cache.find(c => c.id == "793161994932060170")
    const numbervc = guild.channels.cache.find(c => c.id == "793161415828701215")
 
        uservc.setName(`Counter: ${user}.`)
        numbervc.setName(`Next Number: ${number}.`)
    
}
client.on("message",async message =>{
  
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
           return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_MESSAGES` permission enabled in this channel and under the role settings.")
        }
        
        updatevc(message.guild,message.member.displayName,currentnum + 1)
        if(ispin(currentnum)){
            message.pin()
        }
        updatenumber(currentnum + 1,message.guild.id)
        updateuser(message.member.id,message.guild.id)
        console.log(`${message.member.id} counted correctly. Number is now ${String(currentnum + 1)}.`)
        var params = {
            "username": message.member.displayName, // the name of the webhook
            "avatar_url": message.member.user.avatarURL(),
            "content": currentnum,}
              
             fetch(process.env.COUNTHOOK, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(params)
        })

        return message.delete()
    } 

   
})
client.login(process.env.token)
const wakeup = require("./server.js")  
wakeup() 
