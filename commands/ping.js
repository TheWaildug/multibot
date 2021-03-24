

module.exports = {
    name: 'ping',
    description: 'This is a ping command',
    async execute(message,args,Discord,client){
        console.log('ping ',message.guild.id)
        console.log('ping, ',message.member.id)
     let perms = await message.guild.me.permissionsIn(message.channel).toArray()
     console.log(perms)
    console.log(perms.includes("EMBED_LINKS"))
    console.log(perms.includes("SEND_MESSAGES"))
    if(!perms.includes("EMBED_LINKS")){
      return message.channel.send(`I cannot send embeds in this channel. Please make sure I have permissions.`).catch(error => {
        console.log(error)
      });
    } 
     let yourping = Date.now() - message.createdTimestamp 
let botping = Math.round(client.ws.ping)
const embed = new Discord.MessageEmbed()
.setColor("RANDOM")
.setDescription(`Message Ping: ${yourping} \n API Ping: ${botping}`)
message.channel.send(`${message.member}, Pong!`,embed)

    }
}
