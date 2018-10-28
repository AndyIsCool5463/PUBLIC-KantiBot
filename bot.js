const Discord = require('discord.js'); // loads Discord
const colors = require('colors'); // Loads colors
const settings = require('./settings.json') // loads settings
const fs = require('fs')
const enmap = require('Enmap')
const Bot = new Discord.Client(); // Defines Bot as a Discord Client
const prefix = "&"; // Prefix
Bot.login(settings.token); // Logs Bot into Discord Servers
Bot.xpDB = new enmap({
  name: "Experience Database"
});
Bot.xpDB.defer.then(() => {
  console.log(colors.yellow("Experience Database has been loaded into memory!"))
})

// Event Handler
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    // If the file is not a JS file, ignore it (thanks, Apple)
    if (!file.endsWith(".js")) return;
    // Load the event file itself
    const event = require(`./events/${file}`);
    // Get just the event name from the file name
    let eventName = file.split(".")[0];
    // super-secret recipe to call events with all their proper arguments *after* the `client` var.
    // without going into too many details, this means each event will be called with the client argument,
    // followed by its "normal" arguments, like message, member, etc etc.
    // This line is awesome by the way. Just sayin'.
    Bot.on(eventName, event.bind(null, Bot));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});
// Command Handler
Bot.commands = new Map();
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Loaded command: ${commandName} ✓ `);
    console.log(`Command Alias: ${JSON.stringify(props.help)}`)
    Bot.commands.set(props.help.name, props);
  });
});
Bot.on('message', message => {
  if(message.author.bot) return;
  if(message.guild) {
      let user = message.author.id;
      const key = `${message.guild.id}-${message.author.id}`;
      const curLevel = Math.floor(0.1 * Math.sqrt(Bot.xpDB.get(key, "points")));

    // XP SYSTEM
    // Bot.xpDB.set(user, {
    //   level: 0,
    //   xp: 1
    // })
    // Bot.xpDB is the enmap Database
    if (Bot.xpDB.get(key, "level") < curLevel) {
      message.reply(`You've leveled up to level **${curLevel}**!`);
    }
      console.log(user)
    //  console.log(Bot.xpDB.get(user))

    Bot.xpDB.ensure(key, {
    user: message.author.id,
    guild: message.guild.id,
    points: 0,
    level: 1
  });
  Bot.xpDB.inc(key, "points");
  }
})