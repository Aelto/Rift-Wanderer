import {gameServer} from './riotInformations.js'


export const sendRequest = (url) => {

    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest()
        req.open("GET", url, true)

        req.onload = () => {
            if (req.status == 200)
                resolve(req.responseText, url)
            else
                reject(req.responseText, url)
        }

        req.send()
    })

}

export const getGameLiveVersion = (apiKey) => {
    const url = `https://global.api.pvp.net/api/lol/static-data/${gameServer}/v1.2/realm?api_key=${apiKey}`

    return sendRequest(url)
}

export const getSummonersInfo = (apiKey, names) => {
    const url = `https://${gameServer}.api.pvp.net/api/lol/${gameServer}/v1.4/summoner/by-name/${names.join(', ')}?api_key=${apiKey}`

    return sendRequest(url)
}

export const getCurrentGameFromSummonerId = (apiKey, id) => {
    const url = `https://${gameServer}.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/${gameServer.toUpperCase()}1/${id}?api_key=${apiKey}`

    return sendRequest(url)
}

export const getRankedStatsFromSummonersIds = (apiKey, ids) => {
    const url = `https://${gameServer}.api.pvp.net/api/lol/${gameServer}/v2.5/league/by-summoner/${ids.join(', ')}/entry?api_key=${apiKey}`

    return sendRequest(url)
}