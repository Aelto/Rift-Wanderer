<template>
    <div id='home-page' class="home-page">

        <transition name='newsummonername'>
            <input class='new-summoner-name' placeholder='new name'
            v-model='newSummonerName'
            v-if='changeNameInputVisible'
            v-on:keypress.enter='setNewSummonerName()'>
        </transition>
        

        <div class='summoner-name'
            v-on:dblclick='toggleChangeNameInputVisibility()'>
            {{ global.summonername }}
        </div>

        <div class='launch-game-button'
            v-bind:class="[global.searchingGame || changeNameInputVisible ? 'active' : '']"
            v-on:click="global.waitForGame()">
            spectate
        </div>

        <div class='app-state' v-bind:text-content="'appState'">
        </div>

    </div>
</template>

<script>
    import {setSummonerName} from '../utils/config.js'

    export default {
        props: {
            global: {
                type: Object,
                default: () => ({})
            }
        },
        methods: {
            toggleChangeNameInputVisibility: function () {
               this.changeNameInputVisible = !this.changeNameInputVisible
            },
            setNewSummonerName: function () {
                this.toggleChangeNameInputVisibility()

                const newName = this.newSummonerName
                
                if ( newName === '' || newName === this.global.summonername )
                    return false

                this.global.summonername = newName
                this.newSummonerName = ''

                setSummonerName( newName )
            }
        },
        data: () => ({
            changeNameInputVisible: false,
            newSummonerName: ''
        })
    }

</script>

<style scoped>
        .newsummonername-enter, .newsummonername-leave-active {
            transform: translate(0, 100%)
        }

        .newsummonername-enter-active, .newsummonername-leave {
            transform: translate(0, 0%)
        }
</style>
