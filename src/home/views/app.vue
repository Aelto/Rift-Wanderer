<template>
    <div id="global">

        <comp-home-page
            :global="global">
        </comp-home-page>
    
        <transition name="loadingscreen">
            <comp-loading-screen
                v-if='global.loadingScreenVisible'
                :global="global">
            </comp-loading-screen>
        </transition>

        <comp-require-apikey
            :global='global'
            v-if=" isApiKeyInvalid() ">

        </comp-require-apikey>

    </div>
</template>

<script>
    import Home from './home.vue'
    import Loading from './loading.vue'
    import ApiKeyModal from './apikeymodal.vue'

    export default {
        components: {
            'comp-home-page': Home,
            'comp-loading-screen': Loading,
            'comp-require-apikey': ApiKeyModal
        },
        props: {
            global: {
                type: Object,
                default: () => ({})
            }
        },
        methods: {
            isApiKeyInvalid: function () {
                
                return this.global.apiKey === ''

            }
        }
    }

</script>

<style scoped>

    #global {
        width: 100vw;
        height: 100vh;
    }

    .loadingscreen-enter {
        opacity: 0;
        transform: scale(0.6);
    }

    .loadingscreen-enter-active, .loadingscreen-leave-active {
        transform: scale(0.8);
    }

</style>
