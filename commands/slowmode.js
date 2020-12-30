module.exports = {
    name: "slowmode",
    description: "changes the slowmode in specified channel",
    execute(message,args,ms){
        var yes = false;
        console.log(`slowmode ${message.guild.id}`);
        console.log(`slowmode ${message.member.id}`)
        //Then check if user have permissions to do that
    if(!message.member.hasPermission("MANAGE_CHANNELS")){
        console.log(`${message.member.id} tried to run the slowmode command in the guild ${message.guild.id}`)
          message.delete(
    
          )
          return;
        }
        if(!message.guild.me.hasPermission(`MANAGE_CHANNELS`)){
          return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_CHANNELS` permission enabled in the channel you want to change slowmode in and under the role settings.");
       }
        if (!args[0]) {
        const myperm = message.guild.me.permissionIn(message.channel.id).hasPermission(`MANAGE_CHANNEL`); 
        
        if(myperm == false){
          return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_CHANNELS` permission enabled in the channel you want to change slowmode in and under the role settings.");
        }
          if(message.channel.rateLimitPerUser == 0){
            return message.channel.send(
                "Current Slowmode in " +
                `<#${message.channel.id}>` +
                " is 0 seconds."
              ); 
          }else{
             return message.channel.send(
                "Current Slowmode in " +
                `<#${message.channel.id}>` +
                " is " +
                ms(message.channel.rateLimitPerUser * 1000, { long: true }) + "."
              ); 
          }
         
        }
        if(!args[0].startsWith("<#")){
          args[1] = args[0]
          args[0] = message.channel.id
        }
        var channel, mentionchannel;
        var cont = true;
        if (message.mentions.channels.first()) {
          channel = mentionchannel = message.mentions.channels.first();
        } else {
          channel = mentionchannel = message.channel.guild.channels.cache.find(
            r => r.id === args[0]
          );
        }
        if (!channel && mentionchannel) {
          message.reply("please # a channel or enter its ID .");
          cont = false;
        }
        if (cont == false) {
          return;
        }
        const myperm = message.guild.me.permissionsFor(channel).toArray();
        var yesperm = false
        myperm.forEach(function(item,index,array){
          if(item == "MANAGE_CHANNEL"){
              yesperm = true
          }
        })
        if(yesperm == false){
          return message.channel.send("I do not have the correct permissions. Please make sure I have the `MANAGE_CHANNELS` permission enabled in the channel you want to change slowmode and under the role settings.");
        }
        console.log(channel.name);
        const perms = message.member.permissionsIn(channel).toArray();
        perms.forEach(function(item,index,array){
          if (item === "MANAGE_CHANNEL") {
            yes = true;
            if (!args[1])
            if(channel.rateLimitPerUser == 0){
              return message.channel.send(
                "Current Slowmode in " +
                `<#${mentionchannel.id}>` +
                " is 0 Seconds."
              );
            }else{
               return message.channel.send(
                "Current Slowmode in " +
                `<#${mentionchannel.id}>` +
                " is " +
                ms(channel.rateLimitPerUser * 1000, { long: true }) + "."
              );}
            console.log(ms(args[1]));
            if (ms(args[1])  > 21600000) {
              return message.reply("You can only go up to "+  ms(21600 * 1000, { long: true }) +".");
            }
            if (channel.type === "text") {
              var e = ms(args[1])
              e = e/1000
              console.log(e);
              channel
                .setRateLimitPerUser(
                  e,
                  `Slowmode changed by ${message.member.user.tag}`
                )
                .catch(error => {
                  console.warn("Error " + error);
                  cont = false;
                  return message.reply("Something went wrong! `" + error + "`");
                }).then(() => {
                  message.channel.send("Sucessfully changed slowmode in <#" +
                mentionchannel.id +
                `> to `  + ms(e * 1000, { long: true })      + ".")
              
            })
            }
            }
        })
    }
}