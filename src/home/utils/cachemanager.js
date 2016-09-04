const fs = require('fs')

import {gameServer} from './riotInformations.js'
import * as api from './api.js'
import {setGameVersion} from './config.js'

const cacheFiles = {}

export const getCacheFile = () => cacheFiles

export const cacheFolderPath = `${__dirname}/../app-data/cache`
export const cacheSummonersFile = `${cacheFolderPath}/summoners_cache.json`
export const cacheRunesFile = `${cacheFolderPath}/runes_cache.json` // this files is downloaded from the servers
export const cacheSpellsFile = `${cacheFolderPath}/spells_cache.json` // this one too
export const cacheChampionsFile = `${cacheFolderPath}/champions_cache.json` // this one too

export const isAppCacheUpdated = (apiKey, gameVersion) => {
    return new Promise( (resolve, reject) => {

        api.getGameLiveVersion(apiKey)
        .then(JSON.parse)
        .then(data => {
            if (gameVersion !== data.v) return reject(data)
            return resolve(data.v)
        })

    })
}

/** -----------------------------------------------
 * this function initializes the cache files
 * and put them into memory to avoid disk accesses
 * and also get a better read speed
 */

export const loadCacheJson = () => {

    fs.readdirSync(cacheFolderPath)
    .forEach(file => {
        // get the file's content
        let content = fs.readFileSync(`${cacheFolderPath}/${file}`, 'utf8')

        if ( !content.length ) return

        cacheFiles[file.replace('.json', '')] = JSON.parse(content)
    })
}

/** -------------------------------------------------------------------
 * everything below this comment will be utilities to help cache usage
 * such as getting a list of the cached summoners 
 * or even getting a rune informations from its ID
 */

// Setters
export const addSummonerInCache = (name, data) => {
    name = name.toLowerCase().split(' ').join('')

    const content = JSON.parse(fs.readFileSync(cacheSummonersFile, 'utf8'))
    content.summoners[name] = data

    fs.writeFileSync(cacheSummonersFile, JSON.stringify(content, null, '\t'))
}

// Getters

// the cachedSummoners functions don't use the memory storage for a faster acces
// because these data are updated frequently and are only read a few times
export const getCachedSummoners = () => JSON.parse(fs.readFileSync(cacheSummonersFile, 'utf8')).summoners

export const getCachedSummonersList = () => Object.keys(getCachedSummoners())

export const isSummonerInCache = (name) => getCachedSummonersList().filter(n => name.toLowerCase() === n).length > 0

export const getSpellInfoFromId = (id) => cacheFiles.spells_cache.data[id]

export const getRunesInfoFromId = (id) => cacheFiles.runes_cache.data[id]

export const getChampionInfoFromName = (name) => {
    return cacheFiles.champions_cache.data[ Object.keys(cacheFiles.champions_cache.data)
        .filter(key => cacheFiles.champions_cache.data[key].name.includes(name))[0] ]
}

export const getChampionInfoFromId = (id) => cacheFiles.champions_cache.data[ id ]

/** ------------------------------------------------------------------
 * everything below this comment will control the app's cache updates
 * it will take the json from the riot's API and then write it down
 * in .json files on the local disk to avoid wasting bandwitch each game
 */

export const updateJsonRuneId = (apiKey) => {
    const url = `https://global.api.pvp.net/api/lol/static-data/${gameServer}/v1.2/rune?runeListData=all&api_key=${apiKey}`

    console.log('updating: Rune')
    return api.sendRequest(url)
    .then(received => {
        received = JSON.stringify(JSON.parse(received), null, '\t')

        fs.writeFileSync(cacheRunesFile, received)
    })
}

export const updateJsonSpellId = (apiKey) => {
    const url = `https://global.api.pvp.net/api/lol/static-data/${gameServer}/v1.2/summoner-spell?dataById=true&spellData=all&api_key=${apiKey}`

    console.log('updating: Spells')
    return api.sendRequest(url)
    .then(received => {
        received = JSON.stringify(JSON.parse(received), null, '\t')

        fs.writeFileSync(cacheSpellsFile, received)
    })
}

export const updateJsonChampionId = (apiKey) => {
    const url = `https://global.api.pvp.net/api/lol/static-data/${gameServer}/v1.2/champion?dataById=true&champData=all&api_key=${apiKey}`

    console.log('updating: Champion')
    return api.sendRequest(url)
    .then((received) => {
        received = JSON.stringify(JSON.parse(received), null, '\t')

        fs.writeFileSync(cacheChampionsFile, received)
    })
}

export const updateAllJsonFile = (apiKey) => {
    console.log('updating cache')
    return Promise.all([
        updateJsonSpellId(apiKey),
        updateJsonRuneId(apiKey),
        updateJsonChampionId(apiKey)
    ]).then( () => {

        return api.getGameLiveVersion(apiKey)
        .then(JSON.parse)
        .then(data => {

            setGameVersion( data.v )

            return data.v
        })

    })
}