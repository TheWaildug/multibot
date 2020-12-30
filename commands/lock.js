const Discord = require("discord.js")
module.exports = {
    name: "lock",
    description: "locks channels",
    async execute(message,args){
        if(!message.member.hasPermission(`MANAGE_MESSAGES`)){
            return message.delete();
        }
        var channel;

        var cont = true;
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
        console.log(channel.name);
        var i;
        var e = "";
        for (i = 0; i < args.length; i++) {
          if (i >= "1") {
            e = e + args[i] + " ";
          }
        }
        args[1] = e;
        var yes = false;
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
          return message.reply("bro they already can't chat here.");
        }
        const perms = message.member.permissionsIn(channel).toArray();
    
        perms.forEach(function(item, index, array) {
          console.log(item, index);
          if (item === "MANAGE_MESSAGES") {
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
                  .setTitle("This channel has been locked.")
                  .setColor(FF000)
                  .setDescription(args[1]);
                channel.send(embed);
                message.delete()
              });
          }
        });
        if (yes === false) {
          return message.reply("dude you cannot do this!");
        }
    }
}