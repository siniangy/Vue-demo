let Vue;

const install = (v) => {
    Vue = v;
    Vue.mixin({
        beforeCreate() {
            const { store } = this.$options;
            if (store) {
                this.$store = store;
            } else {
                this.$store = this.$parent && this.$parent.$store;
            }
        }
    })
}
const forEach = (obj, cb) => {
    Object.keys(obj).forEach((key) => {
        cb(key, obj[key], obj);
    });
};

class Store {
    constructor(options) {
        const { state, mutations, actions, getters } = options;
        this._vm = new Vue({
            data: { state }
        });
        this.mutations = options.mutations || {};
        forEach(mutations, (key, mutation) => {
            this.mutations[key] = (payload) => {
                mutation(this.state, payload);
            }
        })
        this.actions = options.actions || {};
        forEach(actions, (key, action) => {
            this.actions[key] = (payload) => {
                action(this, payload);
            };
        })
        this.getters = options.getters || {};
        forEach(getters, (key, getter) => {
            Object.defineProperty(this.getters, key, {
                get: () => {
                    return getter(this.state);
                }
            });
        })
    }
    get state() {
        return this._vm.state
    }
    commit(type, payload) {
        console.log(this);
        const mutation = this.mutations[type];
        if (mutation) {
            mutation(payload);
        }
    }
    dispatch(type, payload) {
        const action = this.actions[type];
        if (action) {
            action(payload);
        }
    }
}

const Vuex = { install, Store }
export default Vuex;