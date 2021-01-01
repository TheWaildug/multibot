const Discord = require("discord.js")
module.exports = async (message,db,client) => {
        console.log(`make suggestion ${message.author.id}`)
        let suggestion
         const isblack = await db.get(`IsBlacklisted-${message.author.id}`)
          console.log(isblack)
          if(isblack !== null)    { return message.reply('You have been blacklisted from making suggestions!')
          }
          console.log('ok')
              message.reply("Please reply with your suggestion.");
              const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
              collector.on('collect', msg => {
                console.log(msg.content)
              
                if(msg.content.toLowerCase() === "cancel"){
                    collector.stop('User has cancelled.')
        
                  return msg.reply('Canceling...')
                }
                
                  msg.reply(`You have entered ${msg.content} . Is that correct? (Yes or No)`);
                  collector.stop('User has inputted.')
        
                  const collector2 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
                  collector2.on('collect', async (mg) =>{
                    console.log("collect 2 " + mg.content)
                   collector2.stop("User has collected.")
                        if(mg.content.toLowerCase() === "yes"){
                          message.reply('Attemping to send suggestion.')
                          suggestion = msg.content
        console.log('suggestion function sent')
        const guild = client.guilds.cache.get('791760625243652127');
        if(!guild) return console.warn('Cannot find guild!')
        const channel = guild.channels.cache.find(c => c.id === '794614913359151126')
        if(!channel) return console.warn('Cannot find channel!')
        let suggestionId = await db.get('SuggestionId')
        if(suggestionId === null){
          suggestionId = "1"
          db.set('SuggestionId',"1")
        }
        console.log(suggestionId)
         const exampleEmbed = new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setTitle("Suggestions")
            .setDescription(`New Suggestion from <@${message.author.id}>`)
            .addFields(
              { name: "Suggestion: ", value: `${suggestion}`},
              { name: "Guild: ", value: `${message.guild}` },
      
            )
            .setTimestamp()
            .setFooter(`Suggestion ID: ${suggestionId}.`)
            .setColor('#1aff1a');
           channel.send(exampleEmbed).then(sentEmbed => {
          sentEmbed.react("👍")
          sentEmbed.react("👎")
          db.set('SuggestionId',Number(suggestionId) + 1)
      })
                    }else if(mg.content.toLowerCase() === "no")
                    return mg.reply('Please wait 3.5 minutes and run modmail again.')
            
                 
                    })
                   
      });
}