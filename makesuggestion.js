const Discord = require("discord.js")
module.exports = async (message,db) => {
    async function makeSuggestion(message){
        var suggestion
         const isblack = await db.get(`IsBlacklisted-${message.member.id}`)
          console.log(isblack)
          if(isblack !== null)    { return message.reply('You have been blacklisted from making suggestions!')
          }
          console.log('ok')
              message.reply("Please reply with your suggestion.");
              const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
              collector.on('collect', msg => {
                console.log(msg.content)
                collector.stop('User has inputted.')
        
                if(msg.content.toLowerCase() === "cancel"){
                    
                  return msg.reply('Canceling...')
                }
                
                  msg.reply(`You have entered ${msg.content} . Is that correct? (Yes or No)`);
                  const collector2 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
                  collector2.on('collect', async (mg) =>{
                    console.log("collect 2 " + mg.content)
                   collector2.stop("User has collected.")
                        if(mg.content.toLowerCase() === "yes"){
                          mg.reply('attemping to send suggestion.')
                          suggestion = msg.content
        console.log('suggestion function sent')
        const guild = client.guilds.cache.get('791760625243652127');
        if(!guild) return console.warn('Cannot find guild!')
        const channel = guild.channels.cache.find(c => c.id === '794614913359151126')
        if(!channel) return console.warn('Cannot find channel!')
        var suggestionId = await db.get('SuggestionId')
        if(suggestionId === null){
          suggestionId = "1"
          setData('SuggestionId',"1")
        }
        console.log(suggestionId)
         const exampleEmbed = new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setTitle("Suggestions")
            .setDescription(`New Suggestion from <@${message.member.id}>`)
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
          setData('SuggestionId',Number(suggestionId) + 1)
      })
                    }else if(mg.content.toLowerCase() === "no")
                    return mg.reply('Please wait 3.5 minutes and run modmail again.')
            
                 
                    })
                   
      });
        
       
      }
}