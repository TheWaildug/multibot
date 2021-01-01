

module.exports = {
    name: 'ping',
    description: 'This is a ping command',
    execute(message,args,Discord,facts,quote,randomNum){
        console.log('ping ',message.guild.id)
        console.log('ping, ',message.member.id)
        let which =  randomNum
      console.log(which)
    if(which === 1){
      let randomfact =  facts[Math.floor(Math.random() * facts.length)];

        console.log('Ping Command Sent Type 1')
        let ping = Date.now() - message.createdTimestamp + " ms";
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setTitle('Pong!')
        .setDescription(ping)
        .addFields(
            { name: 'Fun Fact', value: `${randomfact}` },
        )
        
        .setTimestamp();
       
    message.channel.send("<@" + message.member.id + ">",exampleEmbed);   
    }  else if(which === 2){
      let randomquote =  quote[Math.floor(Math.random() * quote.length)];

        console.log('Ping Command Sent Type 2')
        let ping = Date.now() - message.createdTimestamp + " ms";
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setTitle('Pong!')
        .setDescription(ping)
        .addFields(
            { name: 'Fun Quote', value: `${randomquote}` },
        )
      
        .setTimestamp();
       
    message.channel.send("<@" + message.member.id + ">",exampleEmbed);   
    
  }
    }
}
