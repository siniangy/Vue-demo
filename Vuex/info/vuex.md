## vuex源码浅析  3.x版本

### 1：官网指南

参考链接： https://vuex.vuejs.org/zh/

Vuex应用核心是一个store容器，其和单纯的全局对象的区别在于

1. Vuex的状态是响应式的

2. 改变store中状态需要显式的commit

#### State

由于Vuex状态是响应式的，因此获得store中状态放在computed计算属性中，触发更新时变动DOM，可以使用mapState辅助函数

```javascript
computed: {
    ...mapState(['count'])
}
```

#### Getter

store中定义getter，可以看做是store中的computed计算属性，接受state作为第一个参数，可以使用mapGetters辅助函数

```javascript
computed: {
    ...mapGetters(['doneTodosCount'])
}
```

#### Mutation

更改Vuex中store中state状态的唯一方法是提交mutation，值得注意的一点mutation必须是同步函数，devtools需要捕捉快照，可以使用mapMutations辅助函数

```javascript
methods: {
    ...mapMutations({
        add: 'increment'
    })
}
```

#### Action

Action中可以包含异步操作，各种请求放进去，在里面提交mutation，而不是直接变更状态，可以使用mapActions函数

```javascript
methods: {
    ...mapActions({
        add: 'increment'
    })
}
```
#### Modules

### 2：实现一个简易版Vuex

参考链接：https://github.com/wangkaiwd/vuex-implement/blob/master/src/myVuex/index.js

Vuex会默认导出一个具有install方法以及Store类的对象

```javascript
const install = (Vue) => {

}

class Store {
    constructor (options) {
        this.options = options;
    }
}

const Vuex = { install, Store };
export default Vuex;
```

为了让Vue所有子组件可以通过$store访问到store，Vuex使用Vue.mixin在beforeCreate钩子中进行全局混入

```javascript
const install = (Vue) => {
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
```

响应式的state，Vuex和全局变量的一个最大区别是，Vuex中的store中的state是响应式的，在state发生变化时可以保证视图有效更新

```javascript
class Store {
    constructor (options) {
        const { state } = options;
        // 通过new Vue实现响应式
        this._vm = new Vue({
            data: { state }
        });
    }
    /**
        属性会定义在实例的原型上
        每次都会获取到最新的this._vm.state
    */
    get state() {
        return this._vm.state
    }
}
```

mutation同步修改state，commit方法传入对应的key来执行mutations中的函数，并且传入state以及payload，完成更新

```javascript
// 实现对象遍历方法 cb是一个函数
const forEach = (obj, cb) => {
  Object.keys(obj).forEach((key) => {
    cb(key, obj[key], obj);
  });
};
// this.$store.commit('xxx', payload)
class Store {
  constructor (options) {
    const { state, mutations } = options;
    // 执行Vue.use会执行install方法，会将全局的Vue赋值为Vue实例
    // 保证state具有响应性
    this._vm = new Vue({
      data: { state }
    });
    this.mutations = {};
    forEach(mutations, (key, mutation) => {
      this.mutations[key] = (payload) => {
        // this.state是不能被更改的
        // 但是这里我们将this._vm.state的地址赋值给了参数state，
        // 之后我们更改的是this._vm.state地址对应的堆内存，而该值是响应式的
        mutation(this.state, payload);
      };
    });
  }

  // 属性会被定义在实例的原型上
  // this.state = this._vm.state
  // 每次都会获取到最新的this._vm.state
  get state () {
    return this._vm.state;
  }

  // 通过commit来修改state
  commit (type, payload) {
    const mutation = this.mutations[type];
    if (mutation) {
      mutation(payload);
    }
  }
}
```

action处理异步任务，dispatch方法派发action，然后在action中执行commit方法触发mutation修改state

```javascript
// this.$store.dispatch('xxx', payload)
class Store {
  constructor (options) {
    // ...
    this.actions = {};
    forEach(actions, (key, action) => {
      this.actions[key] = (payload) => {
        // action中的第一个参数为Store的实例，可以通过commit来更改state
        // 也可以通过dispatch来派发另一个action
        action(this, payload); // this是store实例context
      };
    });
    // 通过bind返回一个函数赋值为this.commit，该函数内部会通过call执行this.commit，
    // 并且会将返回函数的参数也传入this.commit
    // 等号右边 => Store.prototype.commit 原型方法
    // 等到左边 => store.commit 实例私有方法
    // this.commit = this.commit.bind(this);
  }

  // 通过commit来修改state
  commit = (type, payload) => {
    const mutation = this.mutations[type];
    if (mutation) {
      mutation(payload);
    }
  };

  dispatch (type, payload) {
    const action = this.actions[type];
    if (action) {
      action(payload);
    }
  }
}
```

实现getters，store中的computed计算属性

```javascript
// $store.getters.xxx
class Store {
  constructor() {
    // do something ...
    this.getters = {};
    forEach(getters, (key, getter) => {
      // 每次取值时都会调用get方法
      Object.defineProperty(this.getters, key, {
        get: () => {
          return getter(this.state);
        }
      });
    });
  }
}
```

### 3：简易版Vuex代码

参考链接：https://juejin.cn/post/6844904183448109063

实现在vuex-demo中

### 4：源码浅析