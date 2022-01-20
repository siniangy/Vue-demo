### Vue-router代码浅析

### 1：官网指南

简单看看算了

### 2：实现一个简易的Vue-router

参考链接： https://juejin.cn/post/7012272146907037732#heading-2

- install方法

类似Vuex，Vue.use(VueRouter)，会执行VueRouter的install方法，并将Vue作为参数传入install

```javascript
let _Vue
VueRouter.install = (Vue) => {
    _Vue = Vue;
    Vue.mixin({
        beforeCreate() {
            if (this.$options.router) {
                this._routerRoot = this;
                // this.$options.router是挂载在根组件上的VueRouter实例
                this.$router = this.$options.router;
                this.$router.init(this);
            } else {
                this._routerRoot = this.$parent && this.$parent._routerRoot;
                this.$router = this._routerRoot.$router;
            }
        }
    })
}
```

- createRouteMap方法

createRouteMap方法会将传进来的routes数组转换成一个Map的数据结构

```javascript
function createRouteMap(routes) {
    const pathList = [];
    const pathMap = {};
    routes.forEach(route => {
        addRouteRecord(route, pathList, pathMap);
    })
    console.log(pathList);
    console.log(pathMap);
    return {
        pathList,
        pathMap
    }
}
function addRouteRecord(route, pathList, pathMap, parent) {
    const path = parent ? `${parent.path}/${route.path}` : route.path; // 拼接children
    const { component, children = null } = route;
    const record = {
        path,
        component,
        children
    }
    if (!pathMap[path]) {
        pathList.push(path);
        pathMap[path] = record;
    }
    if (children) {
        children.forEach(child => addRouteRecord(child, pathList, pathMap, record));
    }
}
export default createRouteMap;
// 
let routes = [{
        path: '/',
        name: 'Home',
        component: {name: 'Home'}
    },
    {
        path: '/about',
        name: 'About',
        component: {name: 'About'},
        children: [
            {
                path: 'child1',
                name: 'Child1',
                component: { name: 'child1' }
            },{
                path:'child2',
                name:'Child2',
                component: { name: 'child2' }
            }
        ]
    }
]
pathList; // [ '/', '/about', '/about/child1', '/about/child2' ]
pathMap; 
/** 
{
  '/': { path: '/', component: { name: 'Home' }, parent: undefined },
  '/about': { path: '/about', component: { name: 'About' }, parent: undefined },
  '/about/child1': {
    path: '/about/child1',
    component: { name: 'child1' },
    parent: { path: '/about', component: [Object], parent: undefined }
  },
  '/about/child2': {
    path: '/about/child2',
    component: { name: 'child2' },
    parent: { path: '/about', component: [Object], parent: undefined }
  }
} 
*/

```

- 路由模式

路由模式包含三种，hash模式（常用，包括一个#号）；history模式（需要服务器端配合）；abstract（非浏览器环境的路由模式）。可以通过mode字段传入

```javascript
import HashHistory from './hashHistory';

class VueRouter {
    constructor(options) {
        this.options = options;
        this.mode = options.mode || 'hash';
        switch (this.mode) {
            case 'hash':
                this.history = new HashHistory(this);
                break;
            case 'history':
                // this.history = new HTML5History(this, options.base);
                break;
            default:
                break;
        }
    }
    init(app) {
        // 初始化时执行一次，保证刷新能渲染
        this.history.transitionTo(window.location.hash.slice(1))
    }
}
```

- HashHistory

通过hashChange事件监听浏览器中url中hash值得变化，并切换相关的组件

```javascript
// location.hash 和 hashChange事件
window.addEventListener('hashchange', function() {
  console.log('The hash has changed!')
}, false);
location.hash='#123'; // 修改hash值触发地址栏的改变，不会刷新页面

class HashHistory {
    constructor(router) {
        this.router = router;
        ensureSlash();
        this.setupHashListener();
    }
    setupHashListener() {
        window.addEventListener('hashChange', () => {
            this.transitionTo(window.location.hash.slice(1));
        })
    }
    transitionTo(location) {
        console.log(location);
        let route = this.router.createMatcher(location);
        console.log(route);
    }
}
function ensureSlash() {
    if (window.location.hash) {
        return;
    }
    window.location.hash = '/'
}
function createRoute(record, location) {
    const res = [];
    if (record) {
        while (record) {
            res.unshift(record);
            record = record.parent;
        }
    }
    return {
        ...location,
        matched: res
    }
}
export default HashHistory。
```

- createMatcher方法

![location去Match组件](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ca738d16f894c33aad9cdb9ee6775e6~tplv-k3u1fbpfcp-watermark.awebp?)

通过hashChange监听拿到最新的hash值，通过createRouteMap方法拿到转换后的routes数组，如何由hash值匹配组件，需要createMatcher方法

```javascript
class VueRouter {
    ...
    createMatcher(location) {
        const { pathMap } = createRouteMap(this.options.routes);
        const record = pathMap[location];
        const local = {
            path：location
        }
        if (record) {
            return cteateRoute(record, local);
        }
        return createRoute(null, local);
    }
}
function createRoute(record, location) {
    const res = [];
    if (record) {
        while (record) {
            res.unshift(record);
            record = record.parent; // 匹配父组件
        }
    }
    return {
        ...location,
        matched: res
    }
}
```

- 响应的hash改变

hash对照拿到最新的组件合集，需要响应式的Vue变量保存，$route

```javascript
// src/hashHistory.js
class HashHistory {
    constructor(router) {
        ...
        this.current = createRoute(null, { path: '/' });
    }
    transtionTo(location) {
        ...
        this.current = route;
    }
    listen(cb) {
        this.cb = cb;
    }
}
// src/my-router.js
class VueRouter {

    // ...原先代码
    
    init(app) {
        // 把回调传进去，确保每次current更改都能顺便更改_route触发响应式
        this.history.listen((route) => app._route = route)
        
        // 初始化时执行一次，保证刷新能渲染
        this.history.transitionTo(window.location.hash.slice(1))
    }

    // ...原先代码
}

VueRouter.install = (Vue) => {
    _Vue = Vue
    // 使用Vue.mixin混入每一个组件
    Vue.mixin({
        // 在每一个组件的beforeCreate生命周期去执行
        beforeCreate() {
            if (this.$options.router) { // 如果是根组件

                // ...原先代码
                
                // 相当于存在_routerRoot上，并且调用Vue的defineReactive方法进行响应式处理
                Vue.util.defineReactive(this, '_route', this.$router.history.current)
            } else {
                // ...原先代码
            }


        }
    })
    
    // 访问$route相当于访问_route Vue原型上绑定变量$route
    Object.defineProperty(Vue.prototype, '$route', {
        get() {
            return this._routerRoot._route
        }
    })
}
```

- router-view组件渲染

```javascript
// src/view.js
const myView = {
    functional: true,
    render(h, { parent, data }) {
        const { matched } = parent.$route
        data.routerView = true // 标识此组件为router-view
        let depth = 0 // 深度索引
        while(parent) {
            // 如果有父组件且父组件为router-view 说明索引需要加1
            if (parent.$vnode && parent.$vnode.data.routerView) {
                depth++
            }
            parent = parent.$parent
        }
        const record = matched[depth]
        if (!record) {
            return h()
        }
        const component = record.component
        // 使用render的h函数进行渲染组件
        return h(component, data)
    }
}
export default myView
```

- route-link跳转

``` javascript
// src/link.js
const myLink = {
    props: {
        to: {
            type: String,
            required: true,
        },
    },
    // 渲染
    render(h) {
        // 使用render的h函数渲染
        return h(
            // 标签名
            'a',
            // 标签属性
            {
                domProps: {
                    href: '#' + this.to,
                },
            },
            // 插槽内容
            [this.$slots.default]
        )
    },
}
export default myLink;
```

### 3：简易版Vue-Router代码

实现在vue-router-demo中

### 4：源码浅析