const Discord = require("discord.js")
const client = new Discord.Client()
const prefixModel = require('./prefix.js')
const fs = require("fs")
const mongoose = require("mongoose")
const randomPing = require("./randomping.js")
const facts = require("./facts.js")
const quote = require("./quotes.js")
mongoose.connect(process.env.mongoPath,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
client.Commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.Commands.set(command.name, command);
}
client.on("ready", async () => {
    console.log("The MultiBot is ready!")
    client.user.setStatus("dnd")

})

client.on("message", async message => {   
    console.log(message.content)
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;
    const data = await prefixModel.findOne({
        guildID: message.guild.id
    })
   
    var prefix
    if(data){
        prefix = data.prefix
    }else if(!data){
        prefix = "c!"
    }
    if(!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();
    if(command == "prefix"){
     client.Commands.get("prefix").execute(message,args,prefixModel)
    }else if(command == "ping"){    
        client.Commands.get('ping').execute(message,args,Discord,facts,quote,randomPing)
    }else if(command == 'invites'){
        client.Commands.get('invites').execute(message,args)
    }else if(command == "invite"){
      if(message.member.id != "432345618028036097"){
          return message.reply('**no**')
      }
      message.channel.send("https://discord.com/oauth2/authorize?client_id=791760755195904020&scope=bot&permissions=8")
    }
})
client.login(process.env.token)
const wakeup = require("./server.js")  
wakeup() 