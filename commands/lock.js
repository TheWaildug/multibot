const Discord = require("discord.js")
module.exports = {
    name: "lock",
    description: "locks channels",
    async execute(message,args){
        if(!message.member.hasPermission(`MANAGE_CHANNELS`)){
            return message.delete();
        }
        let channel;
        
        let cont = true;
        if (message.mentions.channels.first()) {
          channel = message.mentions.channels.first();
        } else {
          channel = message.channel.guild.channels.cache.find(
            r => r.id === args[0]
          );
        }
        if (!channel) {
          message.reply("please # a channel or enter its ID .");
          cont = false;
        }
        if (cont == false) {
          return;
        }

        let perms = await message.guild.me.permissionsIn(channel).toArray()
        console.log(perms)
    console.log(perms.includes("MANAGE_CHANNEL"))
    console.log(perms.includes("SEND_MESSAGES"))
    if(!perms.includes("MANAGE_CHANNEL")){
      return message.channel.send(`I cannot lock this channel. Please make sure I have the permission \`MANAGE_CHANNELS\` in this channel and in other channels you want to lock.`).catch(error => {
        console.log(error)
      })
    }
        console.log(channel.name);
        let i;
       let e = message.content.split(" ").splice(2).join(" ")
        args[1] = e;
        let yes = false;
        console.log(args[1]);
        const everyone = message.guild.roles.cache.find(
          r => r.name === "@everyone"
        );
        if (!args[1]) {
          args[1] = "This channel has been locked. You cannot chat here.";
        }
        let canchat = channel.permissionsFor(everyone).serialize();
        if (!canchat.SEND_MESSAGES) {
          yes = false;
          cont = false;
          return message.reply("They already can't chat here.");
        }
        
        const perms2 = message.member.permissionsIn(channel)
     if(perms2.has("MANAGE_CHANNELS")){
         
            console.log("idk man");
            yes = true;
            const everyone = message.channel.guild.roles.cache.find(
              r => r.name === "@everyone"
            );
            channel
              .updateOverwrite(
                everyone,
                {
                  SEND_MESSAGES: false
                },
                `This has been changed by ${message.member.user.tag}`
              )
              .catch(error => {
                console.warn("Error " + error);
                cont = false;
                return message.reply("Something went wrong! `" + error + "`");
              })
              .then(() => {
                message.reply(
                  "Successfully locked the channel <#" + channel.id + ">"
                );
                const embed = new Discord.MessageEmbed()
                  .setTitle("This channel has been locked by a moderator: " + message.member.user.tag + ".")
                  .setColor("RANDOM")
                  .setDescription(`Reason: ${args[1]}`);
                channel.send(embed);
                message.delete()
              });
          }else if(!perms2.has("MANAGE_CHANNELS")){
            return message.delete();
          }
  
    }
}