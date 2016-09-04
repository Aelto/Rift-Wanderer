//import Vue from '../lib/vue.js'
const ipc = require('electron').ipcRenderer

import app from './views/app.vue'

import * as Config from './utils/config.js'
import * as locker from './utils/locker.js'
import * as cacheManager from './utils/cachemanager.js'
import * as api from './utils/api.js'
import * as spectator from './utils/spectator.js'

window.api = api

// Vue.js manipulation
const data = {
    global: {
        summonername: Config.getSummonerName(),
        apiKey: Config.getApiKey(),
        gameVersion: Config.getGameVersion(),
        gameData: {},
        
        // app state
        loadingScreenVisible: false,
        searchingGame: false
    }
    // NOTE: app functions are not stored in the global object
}
window.data = data

// Riot API & electron manipulation
{

    // we set the interval in milliseconds at which the app will check
    // if the summoner is in a game or not
    const gameCheckInterval = 2000

    // we store the id of the timeout created when we check every X seconds
    // it is used to cancel the 'waitForGame' function for example
    let timeoutId = null

    // this is a event function, it is triggered when the user clicks
    // the button to start searching for the game
    // all it does is regularely check if the summoner is in a game
    // and if yes: start call the spectateGame function
    const waitForGame = data.global.waitForGame = () => {

        if ( !locker.setState('waitForGame', 'idle') )
            throw new Error('Could not search for a game, the app is not ready yet.')

        // we clear any timeout
        // in case there are two instances running at the same time
        cancelWaitForGame()

        // we lock the interface from any user interaction
        // (uses vue.js events)
        data.global.searchingGame = true
        
        spectator.isSummonerInGame( data.global.apiKey, data.global.summonername )
        .then( spectateGame, (error, customMessage) => {

            // we go back to idle state, if the 'waitForGame'
            // is still running, the state will be updated automatically
            locker.setState('idle', 'waitForGame')

            console.log(customMessage)

            // TODO: look for any error message
            // if the summonername doesn't exist for example
            if ( customMessage === 'summonerNotFound') {

                data.global.searchingGame = false

                throw new Erro(`No summoner was found with the name ${data.global.summonername}`)

            } else if ( customMessage === 'gameNotFound') {

                // the user is not in a game, we wait for 2seconds
                // before we try again, it prevents a restriction on riot API
                timeoutId = setTimeout(waitForGame, gameCheckInterval)

            } else {

                data.global.searchingGame = false

                throw new Error('An unknown error occured, returning to idle state' + error)

            }

            
        })

    }

    const cancelWaitForGame = data.cancelWaitForGame = () => {

        // clears any timeouts
        clearTimeout( timeoutId )
        // and set it to null to tell there is no timeout running
        timeoutId = null

    }

    const spectateGame = ( unformatedData ) => {

        console.log('found game')

        if ( !locker.setState('getGameData', 'waitForGame') )
            throw new Error(`A game was found, the data were downloaded. But the app' state doesn't match with what is happening`)
        // we know the user is in a game
        // all we have to do now is
        //  > get the summoner's ID and its game ID
        //  > find the data and download it
        //    (uhm... actually the 2 first steps are done when looking if the summoner
        //    is in a game or not, because the only way to check that is to download
        //    the current game data)
        //  > map and filter the data into something readable
        //  > use the data to update the dom
        //  > show the dom with amazing animations !
        // we'll then rely on the loadingScreen events

        // we get readable data from something filled with useless data for us
        const formatedData = spectator.formateGameData( unformatedData )

        // we call a function which adds more data into 'formatedData'
        // by fetching it in the riot API, it returns the 'full' data we need
        spectator.getCurrentGameRankedStats( data.global.apiKey, formatedData )
        .then( fullData => {
            // now that we have the full data,
            // we let the vue.js black magic happen :)

            if ( !locker.setState('showLoadingScreen', 'getGameData') )
                throw new Error('')
            
            data.global.loadingScreenVisible = true
            
            Object.keys( fullData ).forEach( key => {
                data.global.gameData[key] = fullData[key]
            })

            ipc.send('appFocus')
            ipc.send('appMaximize')

        })

    }

    const leaveLoadingScreen = data.global.leaveLoadingScreen = () => {

        if ( !locker.setState('idle', 'showLoadingScreen') )
                throw new Error('Could not leave loading screen')

        data.global.loadingScreenVisible = false

        ipc.send('appUnmaximize')

        data.global.searchingGame = false
    }

    const cacheHasUpdated = (successfullyLeftState) => {

        console.log(`Rift Wanderer now uses the same version as Riot's client`)

        // we receive the boolean returned by the locker.unlockState
        // if the boolean is set to 'false' it means two operations
        // occured in the same time and it is not supposed to
        if ( !successfullyLeftState )
            throw new Error(`Unsuccessfully left 'cacheUpdates' state\nNow pausing the App.`)    

        // loads the cache files into memory for faster access
        cacheManager.loadCacheJson()

        // the app has done all the necessary setup,
        // we now wait for the user activity
        locker.setState('idle')

    }
    
    if ( locker.setState('cacheUpdates', 'null') ) {
        // we'll be checking for any updates available for the cache
        // it happens when the app has in the cache the data from an old patch of the game
        cacheManager.isAppCacheUpdated( data.global.apiKey, data.global.gameVersion )
        // if the app does not uses the same version as the Riot client, update cache files
        .then(null, () => cacheManager.updateAllJsonFile(data.global.apiKey) )
        // we update the in-memory client's version
        .then(() => data.global.gameVersion = Config.getGameVersion())
        // leave the 'cacheUpdates' state
        .then(() => locker.unlockState('cacheUpdates'))
        // continue...
        .then(cacheHasUpdated)
        
    } else
        throw new Error(' Looks like there is a problem with the app and its architecture ')
}

const appVue = new Vue({
    el: '#app-wrapper',
    components: { app },
    data
})