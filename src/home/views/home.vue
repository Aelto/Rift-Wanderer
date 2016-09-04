<template>
    <div id='home-page' class="home-page">
        
        <div class='edit-button'
            v-on:click='toggleChangeNameInputVisibility()'>
            change summoner name
        </div>

        <transition name='newsummonername'>
            <input class='new-summoner-name' placeholder=''
            v-model='newSummonerName'
            v-if='changeNameInputVisible'
            v-on:keypress.enter='setNewSummonerName()'
            >
        </transition>
        

        <div class='launch-game-button summoner-name'
            v-bind:class="[global.searchingGame ? 'active' : '']"
            v-on:click="global.waitForGame()">
            {{ global.summonername }}
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

                if ( this.changeNameInputVisible ) {
                    document.querySelector('.edit-button').style.minHeight = '100%'
                    document.querySelector('.launch-game-button').style.opacity = '0.3'
                } else {
                    document.querySelector('.edit-button').style.minHeight = '0%'
                    document.querySelector('.launch-game-button').style.opacity = '1'
                }
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
            opacity: 0;
            max-width: 0%!important;
        }
</style>
