const { Client, GatewayIntentBits, ActivityType, Partials, EmbedBuilder  } = require('discord.js');
const config = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.DirectMessages], partials: [Partials.Channel] });

const express = require('express')
const bodyParser = require('body-parser')

let app = express()
let jsonParser = bodyParser.json()
// var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/send-changelog', jsonParser, async function (req, res) {
  try {
    const commitCount = req.body.commits.length
    const repoName = req.body.repository.name

    let embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setAuthor({ name: repoName, iconURL: 'https://cdn.discordapp.com/attachments/1192201628107939903/1197241174163980318/prismalogs-main.png?ex=65ba8cbb&is=65a817bb&hm=37e4bc06d2e059c691a75692c324e6424f6d91b63a4dbabc14153a1a86a37814&g', url: `https://github.com/${req.body.repository.full_name}` })
    .setDescription(commitCount + " nieuwe commits aan origin/master")

    const logsChannel = await client.channels.fetch(config.channelID);
    await logsChannel.send({ embeds: [embed] })

    for (const commit of req.body.commits) {
      embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(commit.message)
      .setFooter({ text: commit.author.name, iconURL: `https://github.com/${commit.author.username}.png` });
      await logsChannel.send({ embeds: [embed] })
    }

    console.log("Succesfully send changelogs..")

  } catch(e) {
    console.log("Failed to send changelog..", e)
  }
});

const port = 3001

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

client.on('ready', () => {
    // create status with member count
    console.log("Bot started..")
    setInterval(() => {
        try {
            const guild = client.guilds.cache.get(config.guildID);
            const memberCount = guild.memberCount;
            client.user.setPresence({
                activities: [{ name: `${memberCount} members`, type: ActivityType.Watching }],
                status: 'dnd',
            });
        } catch(e) {
            client.user.setPresence({
                activities: [{ name: `Some errors..`, type: ActivityType.Watching }],
                status: 'dnd',
            });
            console.log(e)
            return
        }
    }, 20000);

})





client.login(config.token);


