
let currentState = 'null'

export const getState = () => currentState

export const unlockState = (state) => {
    if ( currentState === state || currentState === 'null' ) {
        currentState = 'null'
        return true
    }
    return false
}

export const setState = (state, oldState) => {
    if ( unlockState(oldState) ) {
        currentState = state

        return true
    }
    return false
}