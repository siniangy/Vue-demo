import Vue from 'vue';
import vuex from './vuex';
Vue.use(vuex);

export default new vuex.Store({
    state: {
        num: 1
    },
    getters: {
        filterNum(state) {
            if (state.num > 5) {
                return 'win'
            }
            if (state.num <= 5) {
                return 'lose'
            }
        }
    },
    mutations: {
        add(state, payload) {
            state.num += payload;
        },
        reduce(state, payload) {
            state.num -= payload;
        }
    },
    actions: {
        asyncAdd(context, payload) {
            setTimeout(() => {
                return context.commit('add', payload)
            }, 2000)
        },
        asyncReduce(context, payload) {
            setTimeout(() => {
                return context.commit('reduce', payload)
            }, 2000)
        }
    }
})