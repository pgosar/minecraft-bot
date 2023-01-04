/**
 * @param {RGBot} bot
 */
function configureBot(bot) {

    bot.setDebug(true);

    // Find and break chest
    async function gatherChest() {
        await gatherEntity('chest')
    }

    async function gatherVillage() {
        let targets = ['chest', 'bell']
        await gatherEntity(targets)
    }

    // This function will make the Bot chop + pick up a named entity.
    async function gatherEntity(entityName) {
        let skipCurrentEntity = false;
        let countBefore = 0
        for (const elem of entityName) {
            countBefore += bot.getInventoryItemQuantity(elem);    
        }
        bot.chat('start search')
        let countAfter = countBefore;
        while (countAfter <= countBefore) {
            //120 reaches both villages through connecting poppies
            const foundEntity = await bot.findBlocks({blockNames: entityName, maxDistance: 120 }).shift();
            if (foundEntity) {
                // If the Bot located one, then go chop it
                let success = await bot.approachAndDigBlock(foundEntity.result)
                if (!success) {
                    // skipCurrentEntity = true;
                    bot.chat('fail')
                } else {
                    // skipCurrentEntity = false;
                    bot.chat('success')
                }
            } else {
                // when this happens, the bot has found everything in the village
                // this makes it go to the next village
                bot.chat('Cannot find block');
                let dest = GoalBlock(70, 67, -110);
                await bot.pathfinder.goto(dest);
            }
            countAfter = 0
            for (const elem of entityName) {
                countAfter += bot.getInventoryItemQuantity(elem);    
            }
            bot.chat('finished cycle')
        }
    }

    // When the Bot spawns, begin the main gathering loop.
    // Before collecting, have the Bot craft pickaxes if it has none.
    bot.on('spawn', async () => {
        bot.chat('Hello, I have arrived!');
        while (true) {
            bot.chat('Looking for points');
            await gatherVillage();
        }
    });
}

exports.configureBot = configureBot;
