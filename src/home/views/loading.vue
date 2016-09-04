<template>
    <div id='loading-screen' class='loading-screen'
        v-on:click="global.leaveLoadingScreen()">

        <video var='loadingVideo' class='vid' autoplay='autoplay' loop>
            <source src='../assets/img/loading-screen.webm'>
        </video>
        <audio var='loadingMusic' src='../assets/audio/loading-audio.mp3' volume='0.2'></audio>

        <div var='loadingContent' class="loading-content">
            <div var='firstLine' class='line'>
                <div var='loadingGameMode' class='game-mode'> {{ global.gameMode }} </div>
                <div var='loadingMapName' class='map-name'> {{ global.mapName }} </div>
            </div>
            <div var='teamContainer' class="team-container">
                <div var='blueTeamDisplay' tilt='container' class="team-display first-team">

                    <!-- champion-case -->
                    <div class="champion-case front"
                        v-for="championCase of global.gameData.team1">

                        <div class="champion-image-holder">
                            <img var='championImage' class="champion-image"
                                :src="championCase.championSplash">
                        </div>

                        <div var='informations' class="informations">
                            <div 
                                v-for='runeType of championCase.runesRecap'
                                :class="getDescription(runeType)">
                                {{ getDescription(runeType) }}
                            </div>
                        </div>

                        <div class="spells-container">
                            <div class="spell">
                                <img var='spell1Image' class='spell-image'
                                    :src="championCase.spell1Splash">
                            </div>
                            <div class="spell">
                                <img var='spell2Image' class='spell-image'
                                    :src="championCase.spell2Splash">
                            </div>
                        </div>

                        <div class="champion-name"> {{ championCase.championInfo.name }} </div>
                        <div class="player-name"> {{ championCase.summonerName }} </div>

                        <div class="league">
                            <img var='leagueImage'
                                :src=" `../assets/img/${championCase.soloQueueStats.tier}_badge.png` ">
                            <div class="division"> {{ championCase.soloQueueStats.tier !== "MASTER" && championCase.soloQueueStats.tier !== "CHALLENGER" ? championCase.soloQueueStats.entries[0].division : '' }} </div>
                            <div class="win-number"> {{ championCase.soloQueueStats.entries[0].wins }} </div>
                            <div class="lose-number"> {{ championCase.soloQueueStats.entries[0].losses }} </div>
                        </div>

                    </div>

                </div>
                <div var='redTeamDisplay' tilt='container' class="team-display second-team">

                    <div class="champion-case front"
                        v-for="championCase of global.gameData.team2">

                        <div class="champion-image-holder">
                            <img var='championImage' class="champion-image"
                                :src="championCase.championSplash">
                        </div>

                        <div var='informations' class="informations">
                            <div 
                                v-for='runeType of championCase.runesRecap'
                                :class="getDescription(runeType)">
                                {{ getDescription(runeType) }}
                            </div>
                        </div>

                        <div class="spells-container">
                            <div class="spell">
                                <img var='spell1Image' class='spell-image'
                                    :src="championCase.spell1Splash">
                            </div>
                            <div class="spell">
                                <img var='spell2Image' class='spell-image'
                                    :src="championCase.spell2Splash">
                            </div>
                        </div>

                        <div class="champion-name"> {{ championCase.championInfo.name }} </div>
                        <div class="player-name"> {{ championCase.summonerName }} </div>

                        <div class="league">
                            <img var='leagueImage'
                                :src=" `../assets/img/${championCase.soloQueueStats.tier}_badge.png` ">
                            <div class="division"> {{ championCase.soloQueueStats.tier !== "MASTER" && championCase.soloQueueStats.tier !== "CHALLENGER" ? championCase.soloQueueStats.entries[0].division : '' }} </div>
                            <div class="win-number"> {{ championCase.soloQueueStats.entries[0].wins }} </div>
                            <div class="lose-number"> {{ championCase.soloQueueStats.entries[0].losses }} </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>

    </div>
</template>

<script>

    export default {
        props: {
            global: {
                type: Object,
                default: () => ({})
            }
        },
        methods: {
            getDescription: (rune) => {
                const value = parseFloat(rune.description)
                const runeDescription = rune.description.replace(value, ((value * rune.count * 10)|0) / 10 )

                return runeDescription
            }
        }
    }

</script>

<style>
    
</style>
