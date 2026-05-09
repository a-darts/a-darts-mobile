
import { MatchX01 } from './backend/src/domain/models/MatchX01';
import { MatchX01Config } from './backend/src/domain/models/MatchX01Config';
import { GameTypes } from './backend/src/domain/enums/GameTypes';

async function test() {
    try {
        const config = new MatchX01Config(
            501,
            GameTypes.FirstTo,
            1,
            1,
            ['Player1']
        );
        
        const match = MatchX01.create('test-match', config);
        const player = match.players[0];
        
        console.log('--- Initial State ---');
        console.log(`Remaining: ${player.remainingScore}`);
        
        console.log('\n--- Adding 3 Throws: 60, 100, 40 ---');
        match.addThrow(60);
        match.addThrow(100);
        match.addThrow(40);
        
        console.log(`Remaining after throws: ${player.remainingScore}`); // Expected: 301
        player.throws.forEach((t: any, i: number) => {
            console.log(`Throw ${i}: score=${t.score}, remaining=${t.remainingScore}`);
        });

        console.log('\n--- Editing Throw 2 (100 -> 80) ---');
        match.editThrow(player.id, 2, 80);
        
        console.log(`Remaining after edit: ${player.remainingScore}`); // Expected: 321
        player.throws.forEach((t: any, i: number) => {
            console.log(`Throw ${i}: score=${t.score}, remaining=${t.remainingScore}`);
        });
        
        console.log('\n--- Stats ---');
        console.log(`Average: ${player.stats.average}`);
        console.log(`Total Darts: ${player.stats.totalDarts}`);

        if (player.remainingScore === 321) {
            console.log('\nSUCCESS: Score recalculated correctly!');
        } else {
            console.log('\nFAILURE: Score mismatch!');
        }
        
    } catch (e) {
        console.error(e);
    }
}

test();
