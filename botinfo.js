const Discord = require("discord.js")

const ms = require("ms")
module.exports = {
  name: `botinfo`,
  description: "shows info about bot",
  execute(message,args,client){
  console.log(`bot info`)
    const emoji = client.emojis.cache.get("810267394999058432")
    const embed = new Discord.MessageEmbed()
    .setAuthor(`Information about ${client.user.username}.`,client.user.displayAvatarURL())
.addField(`Bot Tag`,client.user.tag)
.addField(`Created with`,`${emoji}`)
.addField(`NodeJS Version`,process.version)
.addField(`Time since last restart`,`${ms(client.uptime,{long: true})}`)
message.channel.send(embed)
return;
  }
}