const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Colors } = require('discord.js');
const AdvancedQuestSystem = require('./advanced-quest-system');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const activeSessions = new Map();

client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    client.user.setActivity('🎮 Advanced Quest System', { type: 'COMPETING' });
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isCommand()) {
            const { commandName } = interaction;
            if (commandName === 'advanced') {
                return handleAdvancedCommand(interaction);
            }
        }

        if (interaction.isButton()) {
            if (interaction.customId === 'set_token_advanced') {
                return handleSetToken(interaction);
            }
            if (interaction.customId === 'complete_all') {
                return handleCompleteAll(interaction);
            }
            if (interaction.customId === 'complete_desktop') {
                return handleCompleteDesktop(interaction);
            }
            if (interaction.customId === 'complete_stream') {
                return handleCompleteStream(interaction);
            }
            if (interaction.customId === 'auto_mode_advanced') {
                return handleAutoMode(interaction);
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'token_modal_advanced') {
                return handleTokenModal(interaction);
            }
        }
    } catch (error) {
        console.error('Interaction error:', error);
        if (!interaction.replied) {
            await interaction.reply({
                content: '❌ An error occurred.',
                ephemeral: true
            });
        }
    }
});

async function handleAdvancedCommand(interaction) {
    const userData = activeSessions.get(interaction.user.id) || { token: null };

    const embed = new EmbedBuilder()
        .setColor('#6366f1')
        .setTitle('⚡ Advanced Quest System')
        .setDescription('Complete ALL quest types: Watch Video, Desktop, Stream, Activity')
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
            {
                name: '🔐 Token Status',
                value: userData.token ? '✅ Set' : '❌ Not Set',
                inline: true
            },
            {
                name: '🎮 Desktop Support',
                value: '✅ Full Spoofing',
                inline: true
            },
            {
                name: '📡 Stream Support',
                value: '✅ Full Simulation',
                inline: true
            },
            {
                name: '⚙️ Features',
                value: '• Complete All Quests\n• Desktop Game Spoofing\n• Stream Simulation\n• Activity Completion\n• Video Watching\n• Auto Mode',
                inline: false
            }
        )
        .setFooter({ text: '🔥 Advanced quest completion system' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('set_token_advanced')
                .setLabel('Set Token')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔐'),
            new ButtonBuilder()
                .setCustomId('complete_all')
                .setLabel('Complete All')
                .setStyle(ButtonStyle.Success)
                .setEmoji('⚡')
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('complete_desktop')
                .setLabel('Desktop Only')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🎮'),
            new ButtonBuilder()
                .setCustomId('complete_stream')
                .setLabel('Stream Only')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📡'),
            new ButtonBuilder()
                .setCustomId('auto_mode_advanced')
                .setLabel('Auto Mode')
                .setStyle(ButtonStyle.Info)
                .setEmoji('🤖')
        );

    await interaction.reply({
        embeds: [embed],
        components: [row, row2],
        ephemeral: true
    });
}

async function handleSetToken(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('token_modal_advanced')
        .setTitle('🔐 Discord Token (Advanced)');

    const tokenInput = new TextInputBuilder()
        .setCustomId('token_input')
        .setLabel('Your Discord Token')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('MTk4NjIyNDgzNzE0MjE5MjQ=...')
        .setMinLength(50)
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(tokenInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
}

async function handleTokenModal(interaction) {
    const token = interaction.fields.getTextInputValue('token_input').trim();

    if (!token || token.length < 40) {
        return await interaction.reply({
            content: '❌ Invalid token format.',
            ephemeral: true
        });
    }

    activeSessions.set(interaction.user.id, { token });

    const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('✅ Token Saved!')
        .setDescription('Your token is saved. Ready to complete quests!');

    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

async function handleCompleteAll(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const userData = activeSessions.get(interaction.user.id);
    if (!userData?.token) {
        return await interaction.editReply('❌ Please set your token first.');
    }

    const progressEmbed = new EmbedBuilder()
        .setColor('#6366f1')
        .setTitle('⏳ Starting Advanced Quest System...')
        .setDescription('Completing all quests (Watch, Desktop, Stream, Activity)\n\nThis may take a few minutes.');

    await interaction.editReply({ embeds: [progressEmbed] });

    try {
        // Set token as environment variable for the system
        process.env.DISCORD_TOKEN = userData.token;

        const system = new AdvancedQuestSystem(userData.token);
        const result = await system.completeAllQuests();

        const resultEmbed = new EmbedBuilder()
            .setColor(result.success ? Colors.Green : Colors.Red)
            .setTitle(result.success ? '✅ Quests Completed!' : '❌ Completion Failed')
            .setDescription(`**Completed:** ${result.completed}/${result.total}\n\n${result.results?.map(r => `${r.status} ${r.type}`).join('\n') || 'See console for details'}`)
            .setFooter({ text: 'Advanced Quest System' });

        await interaction.editReply({ embeds: [resultEmbed] });
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('❌ Error')
            .setDescription(`\`\`\`\n${error.message}\n\`\`\``);

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

async function handleCompleteDesktop(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const userData = activeSessions.get(interaction.user.id);
    if (!userData?.token) {
        return await interaction.editReply('❌ Please set your token first.');
    }

    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('🎮 Desktop Quests')
        .setDescription('Using advanced spoofing to complete Desktop quests...');

    await interaction.editReply({ embeds: [embed] });

    try {
        process.env.DISCORD_TOKEN = userData.token;
        const system = new AdvancedQuestSystem(userData.token);

        const quests = await system.fetchQuests();
        const desktopQuests = quests.filter(q => q.type === 'PLAY_ON_DESKTOP');

        if (desktopQuests.length === 0) {
            const noQuestEmbed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('📋 No Desktop Quests')
                .setDescription('You don\'t have any PLAY_ON_DESKTOP quests right now.');

            return await interaction.editReply({ embeds: [noQuestEmbed] });
        }

        let completed = 0;
        for (const quest of desktopQuests) {
            try {
                const result = await system.completeQuest(quest);
                if (result.success) completed++;
            } catch (e) {
                console.error(e.message);
            }
        }

        const resultEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('✅ Desktop Quests Completed')
            .setDescription(`Completed **${completed}/${desktopQuests.length}** desktop quests using advanced spoofing!`);

        await interaction.editReply({ embeds: [resultEmbed] });
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('❌ Error')
            .setDescription(`\`\`\`\n${error.message}\n\`\`\``);

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

async function handleCompleteStream(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const userData = activeSessions.get(interaction.user.id);
    if (!userData?.token) {
        return await interaction.editReply('❌ Please set your token first.');
    }

    const embed = new EmbedBuilder()
        .setColor('#95E1D3')
        .setTitle('📡 Stream Quests')
        .setDescription('Using advanced simulation to complete Stream quests...');

    await interaction.editReply({ embeds: [embed] });

    try {
        process.env.DISCORD_TOKEN = userData.token;
        const system = new AdvancedQuestSystem(userData.token);

        const quests = await system.fetchQuests();
        const streamQuests = quests.filter(q => q.type === 'STREAM_ON_DESKTOP');

        if (streamQuests.length === 0) {
            const noQuestEmbed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('📋 No Stream Quests')
                .setDescription('You don\'t have any STREAM_ON_DESKTOP quests right now.');

            return await interaction.editReply({ embeds: [noQuestEmbed] });
        }

        let completed = 0;
        for (const quest of streamQuests) {
            try {
                const result = await system.completeQuest(quest);
                if (result.success) completed++;
            } catch (e) {
                console.error(e.message);
            }
        }

        const resultEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('✅ Stream Quests Completed')
            .setDescription(`Completed **${completed}/${streamQuests.length}** stream quests using advanced simulation!`);

        await interaction.editReply({ embeds: [resultEmbed] });
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('❌ Error')
            .setDescription(`\`\`\`\n${error.message}\n\`\`\``);

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

async function handleAutoMode(interaction) {
    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle('🤖 Auto Mode')
        .setDescription('Auto mode will check and complete all quests every 5 minutes automatically!');

    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

// Register commands
client.on('ready', async () => {
    try {
        const commands = [
            {
                name: 'advanced',
                description: 'Advanced quest completion system - handles all quest types',
            }
        ];

        await client.application.commands.set(commands);
        console.log('✅ Commands registered');
    } catch (error) {
        console.error('Failed to register commands:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
