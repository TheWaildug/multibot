
const Discord = require("discord.js")
module.exports = {
    name: 'serverinfo',
    description: 'This is a server info command',
    execute(message,args){
        console.log('serverinfo ', message.guild.id)
        console.log('serverinfo, ', message.member.id)
       const { guild } = message
       const { name, region, memberCount, owner} = guild
       let userCount = guild.members.cache.filter(
        member => !member.user.bot
      ).size;
      let botCount = guild.members.cache.filter(member => member.user.bot).size;
       const icon = guild.iconurl()
       const embed = new Discord.MessageEmbed()
       .setTitle(`Server info for "${name}".`)
       .setThumbnail(icon)
       .addFields(
        {name: `Owner:`, value: owner.user.tag},
           {name: `Region:`, value: region},
           {name: `Member Count`, value: memberCount},
           {name: `User Count`,value: userCount},
           {name: `Bot Count`,value: botCount},
           
           )
           message.channel.send(embed)
    }
}
