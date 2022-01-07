## vuex源码浅析  

### 1：官网指南

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