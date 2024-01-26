import discord
import os
from discord.ext import commands
from dotenv import load_dotenv

intents = discord.Intents.all()
client = commands.Bot(command_prefix='!', intents=intents)

load_dotenv()

# Get the Discord bot token from the environment variables
TOKEN = os.getenv('TOKEN')

@client.event
async def on_ready():
    print('Bot is ready!')

    # Set streaming status
    await client.change_presence(activity=discord.Streaming(name='Cooking', url='https://www.youtube.com/watch?v=dQw4w9WgXcQ'))

# Add your other event handlers and bot functionality here
@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('$hello'):
        await message.channel.send('Hello!')


# Run the bot with your token
client.run(TOKEN)
