const { createStore } = Vuex

const authModule = {
    namespaced: true,
    state: () => ({
        isAuthenticated: false,
        user: null,
        userFullName: null
    }),
    mutations: {
        SET_AUTHENTICATED(state, value) {
            state.isAuthenticated = value
        },
        SET_USER(state, user) {
            state.user = user
            state.userFullName = user?.name || null
        },
        CLEAR_USER(state) {
            state.user = null
            state.userFullName = null
        }
    },
    actions: {
        updateAuthState({ commit }, isAuthenticated) {
            commit('SET_AUTHENTICATED', isAuthenticated)
        },
        updateUser({ commit }, user) {
            commit('SET_USER', user)
        },
        clearAuth({ commit }) {
            commit('SET_AUTHENTICATED', false)
            commit('CLEAR_USER')
        }
    },
    getters: {
        isAuthenticated: state => state.isAuthenticated,
        user: state => state.user,
        userFullName: state => state.userFullName
    }
}

export function createAppStore() {
    return createStore({
        modules: {
            auth: authModule
        }
    })
}
