Lerna是一个使用git和npm来处理多包依赖管理的工具，利用它能够自动帮助我们管理各种模块包之间的版本依赖关系。可以让你在主项目下管理多个子项目，从而解决了多个包互相依赖，且发布时需要手动维护多个包的问题。

## demo源码
[https://github.com/m-alfred/lerna-example](https://github.com/m-alfred/lerna-example)

## 安装
全局安装lerna
```
yarn global add lerna
```

## 初始化项目
在一个空目录中执行初始化命令
```
lerna init
```
默认固定模式(Fixed mode)，packages下所有包共用一个版本号。

也可以使用
```
lerna init --independent
```
使用独立模式，每个包允许有一个独立的版本号。

> lerna.json设置version为independent可以运行independent模式

生成以下文件
```
packages/
package.json
lerna.json
```

lerna.json
- version: 记录当前项目的版本号
- npmClient: 你可以指定使用npm, cnpm或yarn来执行命令
- command.publish.ignoreChanges: 忽略特定的项
- command.publish.npmClientArgs: 当执行lerna bootstrap命令时，传给npm install的参数
- command.publish.message: 发布模块的时候，填写的commit信息
- packages: 模块包默认所在的地址

## 命令
```
lerna add <pkg> [globs..]  Add a single dependency to matched packages
lerna bootstrap            Link local packages together and install remaining package dependencies
lerna changed              List local packages that have changed since the last tagged release                   [aliases: updated]
lerna clean                Remove the node_modules directory from all packages
lerna create <name> [loc]  Create a new lerna-managed package
lerna diff [pkgName]       Diff all packages or a single package since the last release
lerna exec [cmd] [args..]  Execute an arbitrary command in each package
lerna import <dir>         Import a package into the monorepo with commit history
lerna info                 Prints debugging information about the local environment
lerna init                 Create a new Lerna repo or upgrade an existing repo to the current version of Lerna.
lerna link                 Symlink together all packages that are dependencies of each other
lerna list                 List local packages                                                                [aliases: ls, la, ll]
lerna publish [bump]       Publish packages in the current project.
lerna run <script>         Run an npm script in each package that contains that script
lerna version [bump]       Bump version of packages changed since the last release.
```

### lerna bootstrap
将本地包链到一起，并安装依赖包，类似`yarn`

#### 工作原理
以babel为例
- babel-generator 和 source-map (等)  是 babel-core 的依赖.
- babel-core 的 package.json 列出了这些包作为依赖。
    ```
    // babel-core package.json
    {
      "name": "babel-core",
      ...
      "dependencies": {
        ...
        "babel-generator": "^6.9.0",
        ...
        "source-map": "^0.5.0"
      }
    }
    ```
- Lerna会检查每个依赖是否也是Lerna仓库的一部分
    - 在这个例子中，`babel-generator`可以是内部依赖项，而source-map始终是外部依赖项（sourcemap不在packages下）。
    - `babel-core`的package.json中`babel-generator`的版本与`packages/babel-generator`一致，将作为内部依赖项
    - `source-map`由npm或yarn正常安装
- `packages/babel-core/node_modules/babel-generator` 将建立连接到 `packages/babel-generator`
- 所以我们可以通过嵌套目录本地引入

#### --use-workspaces
开启与[yarn workspaces](https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-workspaces-install-phase-1.md)集成，当--use-workspaces设置为true，则lerna.json下的packages将会被package.json中的workspaces覆盖

### lerna add 
安装依赖
```
lerna add module-1 packages/prefix-*        Adds the module-1 package to the packages in the 'prefix-' prefixed folders
lerna add module-1 --scope=module-2         Install module-1 to module-2
lerna add module-1 --scope=module-2 --dev   Install module-1 to module-2 in devDependencies
lerna add module-1 --scope=module-2 --peer  Install module-1 to module-2 in peerDependencies
lerna add module-1                          Install module-1 in all modules except module-1
lerna add module-1 --no-bootstrap           Skip automatic `lerna bootstrap`
lerna add babel-core                        Install babel-core in all modules
```

### lerna clean
清除所有包下的node_modules

### lerna link
将所有相互依赖的包符号链接在一起

### lerna exec
在每个包中执行任意命令

### lerna run
在每个包中运行npm脚本如果该包中存在该脚本

## 新建模块
新建moduleA和moduleB， 其中moduleA依赖moduleB
```
lerna create module-a
lerna create module-b
```
在module-a中引入module-b
```
// module-a
'use strict';
const moduleB = require('module-b');
console.log('moduleB:', moduleB());

module.exports = moduleA;

function moduleA() {
    return 'it\'s module a';
}
```
```
// module-b
'use strict';

module.exports = moduleB;

function moduleB() {
    return 'it\'s module b';
}
```
此时运行`node packages/module-a/lib/module-a.js`
会报错,提示找不到module-b模块
```
internal/modules/cjs/loader.js:800
    throw err;
    ^

Error: Cannot find module 'module-b'
Require stack:
```
这是因为我们还没在moduleA中安装依赖，执行
```
lerna add module-b --scope=module-a
```
scope后面跟包名,
在moduleA中添加moduleB依赖

可以看到module-a node_modules目录下安装了module-b包
重新运行上面的module-a代码，会输出
```
$ node packages/module-a/lib/module-a.js                               
moduleB: it's module b
```

## 发布
通过`lerna publish`发布包

将module-a、module-b改个名称

示例中统一加上@m_alfred前缀
- @m_alfred/module-a
- @m_alfred/module-b

登录npm，执行
```
npm login
```
输入用户、密码登录

```
lerna publish
```
发布完成，即可在你的npm仓库看到对应的包
```
$ lerna publish
lerna notice cli v3.22.1
lerna info current version 0.0.2
lerna info Looking for changed packages since v0.0.2
? Select a new version (currently 0.0.2) Patch (0.0.3)

Changes:
 - @m_alfred/module-a: 0.0.2 => 0.0.3
 - @m_alfred/module-b: 0.0.2 => 0.0.3

? Are you sure you want to publish these packages? Yes
lerna info execute Skipping releases
lerna info git Pushing tags...
lerna info publish Publishing packages to npm...
lerna info Verifying npm credentials
lerna http fetch GET 200 https://registry.npmjs.org/-/npm/v1/user 1257ms
lerna http fetch GET 200 https://registry.npmjs.org/-/org/m_alfred/package?format=cli 1405ms
lerna info Checking two-factor auth mode
lerna http fetch GET 200 https://registry.npmjs.org/-/npm/v1/user 408ms
lerna success published @m_alfred/module-b 0.0.3
lerna notice 
lerna notice 📦  @m_alfred/module-b@0.0.3
lerna notice === Tarball Contents === 
lerna notice 1.1kB LICENSE        
lerna notice 94B   lib/module-b.js
lerna notice 584B  package.json   
lerna notice 116B  README.md      
lerna notice === Tarball Details === 
lerna notice name:          @m_alfred/module-b                      
lerna notice version:       0.0.3                                   
lerna notice filename:      m_alfred-module-b-0.0.3.tgz             
lerna notice package size:  1.3 kB                                  
lerna notice unpacked size: 1.9 kB                                  
lerna notice shasum:        f530a9abcab3373758574f5b48c6f9eb65788d2a
lerna notice integrity:     sha512-KFEkbN8COpoSj[...]2LRs0hY5U+z2w==
lerna notice total files:   4                                       
lerna notice 
lerna http fetch PUT 200 https://registry.npmjs.org/@m_alfred%2fmodule-b 3077ms
lerna success published @m_alfred/module-a 0.0.3
lerna notice 
lerna notice 📦  @m_alfred/module-a@0.0.3
lerna notice === Tarball Contents === 
lerna notice 1.1kB LICENSE        
lerna notice 177B  lib/module-a.js
lerna notice 620B  package.json   
lerna notice 116B  README.md      
lerna notice === Tarball Details === 
lerna notice name:          @m_alfred/module-a                      
lerna notice version:       0.0.3                                   
lerna notice filename:      m_alfred-module-a-0.0.3.tgz             
lerna notice package size:  1.3 kB                                  
lerna notice unpacked size: 2.0 kB                                  
lerna notice shasum:        27a2413b6761b76548ac199aa2df0377768715f5
lerna notice integrity:     sha512-2H1QB5FdRaAuR[...]p7RYrOI2QdjSQ==
lerna notice total files:   4                                       
lerna notice 
lerna info lifecycle root@undefined~publish: root@undefined
lerna http fetch PUT 200 https://registry.npmjs.org/@m_alfred%2fmodule-a 6363ms

> root@undefined publish /Users/alfred/workspace/jack-bean/lerna-example
> lerna publish

lerna notice cli v3.22.1
lerna info current version 0.0.3
lerna notice Current HEAD is already released, skipping change detection.
lerna success No changed packages to publish 
Successfully published:
 - @m_alfred/module-a@0.0.3
 - @m_alfred/module-b@0.0.3
lerna success published 2 packages
```
发布后，单独修改moduleB代码，再执行发布命令
```
Changes:
 - @m_alfred/module-a: 0.0.3 => 0.0.4
 - @m_alfred/module-b: 0.0.3 => 0.0.4
```
可以看到module-a版本也升级了，这是由于我们`lerna init`的时候使用了默认的Fixed mode模式，packages下所有包都会使用同一版本号。

### 批量运行npm scripts
在module-a和module-b下新增lint命令
```
// packages.json
"scripts": {
    // ...
    "lint": "eslint --fix --ext .js ./"
  },
```
执行`lerna run lint`
则会同时运行module-a和module-b下的lint脚本
或者可以通过`lerna exec`命令
```
lerna exec yarn run lint
```
也同样可以批量执行命令

使用scope限制module-a中执行脚本
```
lerna run --scope=@m_alfred/module-a  lint
```

### 共用devDependencies
开发过程中，很多模块都会依赖babel、eslint等模块，这些大多都是可以共用的。

我们可以通过`lerna link convert`命令，lerna会将各个包package.json中共同的devDependencies移动到根目录的package.json中，将它们提升到项目根目录中，这样做的好处有：

- 所有包使用相同版本的依赖，统一管理
- 可使用自动化工具让根目录下的依赖保持更新
- 减少依赖的安装时间，一次安装，多处使用
- 节省存储空间，安装在根目录的node_module下

## Lerna Wizard
lerna的命令行向导。它将引导您完成一系列明确定义的lerna步骤：
### 安装
```
yarn global add lerna-wizard
```

## 常见问题
#### 1. 发布包时出现lerna http fetch PUT 402 lerna ERR! E402 You must sign up for private packages
当你发布scoped包，也就是带了前缀例如@alfred/时，默认是发私有库的，需要在发布命令后面添加`--access public`
#### 2. lerna http fetch PUT 403, lerna ERR! E403 Forbidden
- 检查npm仓库登录状态
- 如已登录，确认scope前缀是否已被占用，已被占用则更改scope值

#### 3. yarn workspaces理解
[yarn workspaces属性](https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-workspaces-install-phase-1.md)允许多个项目依赖同一安装和管理，当运行yarn命令时，yarn会收集workspace下package.json里所有依赖，这些依赖都会向上提升，生成一个单独的yarn.lock并安装在一个单独的node_modules下

#### 4.lerna ERR! EFILTER No packages remain after filtering [ 'module-a' ]
lerna命令的scope值错误导致过滤对应包名后，找不到对应的packages，scope值应该为对应包名即package.json中的name而不是目录名

#### 5.ERR! ENOLERNA `lerna.json` does not exist, have you run `lerna init`?
当从independent切换为fixed时，如果lerna.json中不存在version就会出现该错误，增加version字段或者执行`lerna init`

## 参考资料
1. [用Lerna管理多包JS项目](https://zhuanlan.zhihu.com/p/33858131)
2. [https://www.jianshu.com/p/8b7e6025354b](https://zhuanlan.zhihu.com/p/33858131)
3. [多包依赖管理--Lerna](https://blog.csdn.net/liuyifeng0000/article/details/109125099)
4. [npm-publish](https://docs.npmjs.com/cli/v6/commands/npm-publish)
5. [https://github.com/lerna/lerna](https://github.com/lerna/lerna)
6. [https://juejin.cn/post/6844903749232623629](https://juejin.cn/post/6844903749232623629)