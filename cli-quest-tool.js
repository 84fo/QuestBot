#!/usr/bin/env node

const AdvancedQuestSystem = require('./advanced-quest-system');
const fs = require('fs');
require('dotenv').config();

/**
 * CLI Tool for Advanced Quest Completion System
 * Usage: node cli-quest-tool.js [command] [options]
 */

const args = process.argv.slice(2);
const command = args[0];

const help = `
╔════════════════════════════════════════════════════════════════╗
║         ADVANCED QUEST COMPLETION SYSTEM - CLI TOOL            ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node cli-quest-tool.js [command] [options]

COMMANDS:
  all                Complete ALL quests (Video, Desktop, Stream, Activity)
  video              Complete only WATCH_VIDEO quests
  desktop            Complete only PLAY_ON_DESKTOP quests (with spoofing)
  stream             Complete only STREAM_ON_DESKTOP quests (with simulation)
  activity           Complete only PLAY_ACTIVITY quests
  list               List all active quests
  help               Show this help message

OPTIONS:
  --token=TOKEN      Use specific token (or set DISCORD_TOKEN env var)
  --delay=MS         Delay between quests (default: 500ms)
  --timeout=SEC      Request timeout (default: 10s)

EXAMPLES:
  node cli-quest-tool.js all
  node cli-quest-tool.js desktop --token=YOUR_TOKEN_HERE
  node cli-quest-tool.js all --delay=1000
  DISCORD_TOKEN=YOUR_TOKEN node cli-quest-tool.js all

ENVIRONMENT:
  DISCORD_TOKEN      Your Discord user token (required)

🔥 FEATURES:
  ✅ Desktop Quest Spoofing - Simulates real game running
  ✅ Stream Spoofing - Simulates real streaming
  ✅ Auto Heartbeats - Sends progress updates
  ✅ All Quest Types - Video, Desktop, Stream, Activity
  ✅ Error Handling - Continues on failures
  ✅ Progress Tracking - Real-time completion status

WARNINGS:
  ⚠️  Use at your own risk
  ⚠️  Desktop/Stream quests use advanced spoofing
  ⚠️  May require account to be in good standing
  ⚠️  Discord may detect patterns
`;

async function main() {
    const token = args.find(a => a.startsWith('--token='))?.replace('--token=', '') || process.env.DISCORD_TOKEN;

    if (!token) {
        console.log(help);
        console.error('\n❌ Error: DISCORD_TOKEN not provided');
        console.error('   Set it: export DISCORD_TOKEN=your_token');
        process.exit(1);
    }

    const system = new AdvancedQuestSystem(token);

    try {
        switch (command) {
            case 'all':
                console.log('🔥 Starting Advanced Quest Completion...\n');
                await system.completeAllQuests();
                break;

            case 'video':
                console.log('📺 Completing VIDEO quests...\n');
                await completeQuestType(system, 'WATCH_VIDEO');
                break;

            case 'desktop':
                console.log('🎮 Completing DESKTOP quests with spoofing...\n');
                await completeQuestType(system, 'PLAY_ON_DESKTOP');
                break;

            case 'stream':
                console.log('📡 Completing STREAM quests with simulation...\n');
                await completeQuestType(system, 'STREAM_ON_DESKTOP');
                break;

            case 'activity':
                console.log('🎯 Completing ACTIVITY quests...\n');
                await completeQuestType(system, 'PLAY_ACTIVITY');
                break;

            case 'list':
                console.log('📋 Fetching your quests...\n');
                const quests = await system.fetchQuests();
                if (quests.length === 0) {
                    console.log('❌ No active quests found');
                } else {
                    console.log(`Found ${quests.length} quests:\n`);
                    quests.forEach((q, i) => {
                        console.log(`${i + 1}. ${q.name}`);
                        console.log(`   Type: ${q.type}`);
                        console.log(`   Duration: ${q.targetSeconds}s\n`);
                    });
                }
                break;

            case 'help':
            default:
                console.log(help);
                break;
        }
    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        process.exit(1);
    }
}

async function completeQuestType(system, questType) {
    const quests = await system.fetchQuests();
    const filtered = quests.filter(q => q.type === questType);

    if (filtered.length === 0) {
        console.log(`❌ No ${questType} quests found\n`);
        return;
    }

    console.log(`Found ${filtered.length} ${questType} quests\n`);

    let completed = 0;
    for (const quest of filtered) {
        try {
            const result = await system.completeQuest(quest);
            if (result.success) completed++;
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
        }
    }

    console.log(`\n✅ Completed ${completed}/${filtered.length} quests\n`);
}

main();
