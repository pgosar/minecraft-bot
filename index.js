/**
 * This strategy is an advanced example of how to customize movements, place blocks, and craft items with the rg-bot package.
 * The Bot will collect coal until it has 100 points-worth of items in its inventory.
 * (Note: Coal_Ore and apples are each worth 1 point.  Why apples you say?  Apples are a possible byproduct from collecting the logs to create new pickaxes.)
 *
 * @param {RGBot} bot
 */
function configureBot(bot) {

    bot.setDebug(true);

    // Find and break chest
    async function gatherChest() {
        await gatherEntity('chest')
    }

    async function gatherVillage() {
        let targets = ['chest', 'poppy', 'bell']

        await gatherEntity(targets)
    }



    // This function will make the Bot chop + pick up a named entity.
    async function gatherEntity(entityName) {

        // Track whether the Bot encountered any issues while chopping.
        // There are so many things around the spawn area that it can
        // simply try to chop a different one
        let skipCurrentEntity = false;
        let countBefore = 0
        for (const elem of entityName) {
            countBefore += bot.getInventoryItemQuantity(elem);    
        }

        // Ensure that if the Bot fails to gather the dropped item,
        // it will try collecting another until its inventory reflects one has been picked up
        bot.chat('start search')
        let countAfter = countBefore;
        while (countAfter <= countBefore) {
            //120 reaches both villages through connecting poppies
            const foundEntity = await bot.findBlocks({blockNames: entityName, maxDistance: 30 }).shift();
            if (foundEntity) {
                // If the Bot located one, then go chop it
                let success = await bot.approachAndDigBlock(foundEntity.result)
                // success = success && await bot.digBlock(foundEntity)
                
                
                if (!success) {
                    // If anything prevents the Bot from breaking the block,
                    // then find the next-closest and try gathering that instead.
                    // skipCurrentEntity = true;
                    bot.chat('fail')
                } else {
                    // skipCurrentEntity = false;
                    bot.chat('success')
                }
            } else {
                // skipCurrentEntity = false;
                // If the Bot didn't find any nearby,
                // then allow it to wander a bit and look again.
                // This loop makes sure it completes the 'wander' movement.
                // let didWander = false;
                // while (!didWander) {
                //     didWander = await bot.wander();
                // }
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

    // The bot will announce whenever it collects ore or an apple
    bot.on('playerCollect', async (collector, collected) => {
        const itemName = bot.getEntityName(collected).toLowerCase();
        if (collector.username === bot.mineflayer().username && (itemName.includes('ore') || itemName === 'apple')) {
            bot.chat(`I collected a(n) ${itemName}`);
        }
    });

    // When the Bot spawns, begin the main gathering loop.
    // Before collecting, have the Bot craft pickaxes if it has none.
    bot.on('spawn', async () => {
        bot.chat('Hello, I have arrived!');

        let oreCollected = bot.getInventoryItemQuantity('coal_ore');
        let applesCollected = bot.getInventoryItemQuantity('apple');

        while (true) {
            bot.chat('Looking for points');
            await gatherVillage();

        }

        // Once the Bot has 100 points, announce it in the chat
        bot.chat(`I reached my goal! I have ${oreCollected} coal_ore and ${applesCollected} apples`);
    });

}

exports.configureBot = configureBot;
