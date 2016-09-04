const fs = require('fs')

export const configPath = `${__dirname}/../app-data/config.json`

// GET
export const getConfig = () => JSON.parse( fs.readFileSync(configPath, 'utf8') )

export const getSummonerName = () => getConfig().summonerName || ''
export const getApiKey = () => getConfig().apiKey || ''
export const getGameVersion = () => getConfig().gameVersion || ''
export const getLastGameId = () => getConfig().lastGameId || -1

// SET
export const setConfig = (newConfig) => fs.writeFileSync( configPath, JSON.stringify(newConfig, null, '\t') )

export const _setConfigKey = ( key, value ) => {
    const config = getConfig()
    config[key] = value

    setConfig( config )
}
export const setSummonerName = (newSummonerName) => _setConfigKey( 'summonerName', newSummonerName)
export const setApiKey = (newApiKey) => _setConfigKey( 'apiKey', newApiKey )
export const setGameVersion = (newGameVersion) => _setConfigKey( 'gameVersion', newGameVersion )
export const setLastGameId = (newLastGameId) => _setConfigKey( 'lastGameId', newLastGameId )