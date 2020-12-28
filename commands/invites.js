module.exports = {
    name: "invites",
    description: "shows all invites",
    execute(message,args){
        console.log('invite ',message.guild.id)
        console.log("invite ",message.member.id)
        var userId = message.author.id;
        var userInvites = message.guild.fetchInvites().then(invites => invites.find(invite => invite.inviter.id === userId));

        var useAmount = userInvites.uses;

        if (useAmount === undefined) {

            message.channel.send(`${message.author.username} has 0 invites`);
        }

        else {
            message.channel.send(`${message.author.username} has ${useAmount} invites`);
        }
    }
}