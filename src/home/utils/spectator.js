
import * as api from './api.js'
import * as cacheManager from './cachemanager.js'
import {gameServer} from './riotInformations.js'

export const isSummonerInGame = (apiKey, summonerName) => {
    return new Promise( (resolve, reject) => {

        // TODO: use a sort of cache to store the last game's data
        // it can be useful if the user decides to check for infos
        // multiples times in the game, it can save bandwidth
        getSummonerData(apiKey, summonerName.toLowerCase())
        .then( summonerData => getSummonerGameData(apiKey, summonerData),
               err => reject(err, 'summonerNotFound'))
        .then( resolve,
               err => reject(err, 'gameNotFound'))

    })


}

export const getSummonerData = (apiKey, summonerName) => {
    return new Promise( (resolve, reject) => {

        console.log('fetching...')

        // we'll look if the summoner is in the cache or not
        // we don't have to send a request to the riot API 
        // it can also save bandwidth (like <1kb !)
        if ( cacheManager.isSummonerInCache(summonerName) ) {
            // the user was found in the cache
            // we retrieve the string and parse it
            resolve( JSON.parse(cacheManager.getCachedSummoners()[summonerName])[summonerName] )

        } else {

            // the user was NOT found in the cache
            // we have to search for the data
            // then add it to cache cache once found (if found)
            api.getSummonersInfo(apiKey, [summonerName])
            .then( data => {
                // the summoner was found in the riot API

                // we add the data to the cache
                cacheManager.addSummonerInCache(summonerName, data)

                // we continue...
                resolve( JSON.parse(data)[summonerName.toLowerCase()] )

            }, errorMessage => {
                // the user was not found if the riot API
                // we continue and pass the error message
                reject(errorMessage)

            })

        }

    })
}

export const getSummonerGameData = (apiKey, summonerData) => {
    return new Promise( (resolve, reject) => {

        api.getCurrentGameFromSummonerId(apiKey, summonerData.id)
        // if no data could be retrieved, we pass the error and move on
        .then( data => JSON.parse(data), reject)
        .then(resolve)

    })
}

export const formateGameData = (data) => {
    data.gameMap = data.mapId === 11 
        ? `summoner's rift`
        : `not summoner's rift`

    data.gameMode = data.gameQueueConfigId === 410
        ? `RANKED`
        : `NORMAL`

    data.team1 = []
    data.team2 = []
    data.summonerIdList = []

    data.participants.map(player => {
        player.spell1Info = cacheManager.getSpellInfoFromId(player.spell1Id)
        player.spell1Splash = `http://ddragon.leagueoflegends.com/cdn/6.5.1/img/spell/${player.spell1Info.key}.png`

        player.spell2Info = cacheManager.getSpellInfoFromId(player.spell2Id)
        player.spell2Splash = `http://ddragon.leagueoflegends.com/cdn/6.5.1/img/spell/${player.spell2Info.key}.png`

        player.championInfo = cacheManager.getChampionInfoFromId(player.championId)

        const name = player.championInfo.key
        player.championSplash = `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${name}_0.jpg`

        if ( !player.soloQueueStats )
            player.soloQueueStats = {
                entries: [{ wins: 0, losses: 0}],
                tier: 'UNRANKED'
            }    

        player.runesRecap = []
        player.runes.forEach(rune => {
            const obj = cacheManager.getRunesInfoFromId(rune.runeId)
            obj.count = rune.count

            player.runesRecap.push(obj)
        })

        if (player.teamId === 100) data.team1.push(player)
        else data.team2.push(player)

        data.summonerIdList.push(player.summonerId)

        return player
    })

    data.bannedChampions.map(ban => {
        ban.championInfo = cacheManager.getChampionInfoFromId(ban.championId)

        return ban
    })

    return data
}

export const getCurrentGameRankedStats = (apiKey, gameData) => {
    console.log(gameData)
    return api.getRankedStatsFromSummonersIds(apiKey, gameData.summonerIdList)
    .then(stats => JSON.parse(stats))
    .then(stats => {

        // here we insert directly into the game data
        // more informations we just fetched
        gameData.participants.map(player => {
            const playerStats = stats[player.summonerId]
            if (!playerStats) return player

            player.rankedStats = playerStats

            const soloQ = playerStats.filter(queue => queue.queue === 'RANKED_SOLO_5x5')[0]

            player.soloQueueStats = soloQ

            return player
        })

        return gameData
    })
}