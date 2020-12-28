
module.exports = {
    name: "prefix",
    description: "changes guild prefix",
    async execute(message,args,prefixModel){
      if(!message.member.hasPermission("MANAGE_GUILD")){
        console.log(`${message.member.id} tried to run prefix in the guild ${message.guild.id}.`)
        return message.delete()
      }
        console.log("prefix ",message.guild.id)
        console.log('prefix ',message.member.id)
      const data = await prefixModel.findOne({
          guildID: message.guild.id
      })
      if(!args[0]) return message.channel.send("You must provide a **new prefix**!");
      if(args[0].length > 5) return message.channel.send("Your new prefix must be under \`5\` characters!");
      if(data){
        await prefixModel.findOneAndRemove({
            guildID: message.guild.id
        })
        if(args[0].toLowerCase() == "reset"){
          message.channel.send(`The prefix has been reset to **c!**`)

          
          let newData = new prefixModel({
              guildID: message.guild.id,
              prefix: "c!",
          })
          newData.save()
         return console.log('yes reset')
        }else{
          message.channel.send(`The new prefix is now **${args[0]}**.`)

          
          let newData = new prefixModel({
              guildID: message.guild.id,
              prefix: args[0],
          })
          newData.save()
          console.log('yes data')
         return console.log(args[0])
        }
          
      }else if(!data){
          
          message.channel.send(`The new prefix is now **${args[0]}**.`)
          let newData = new prefixModel({
            guildID: message.guild.id,
            prefix: args[0],
        })
        newData.save()
        console.log('no data')
        console.log(args[0])
      } 
    }

}
