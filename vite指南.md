# create-vite-app

Create an app powered by [Vite](https://github.com/vitejs/vite).

```bash
$ npm init vite-app <project-name>
$ cd <project-name>
$ npm install
$ npm run dev
```

If using Yarn:

```bash
$ yarn create vite-app <project-name>
$ cd <project-name>
$ yarn
$ yarn dev
```

## Templates

Available templates:

- `vue` (default)
- `vue-ts` (experimental)
- `react`
- `react-ts`
- `preact`
- `preact-ts`
- `reason-react`

To scaffold with specific template:

```bash
$ npm init vite-app my-react-project --template react
```

For use with Svelte, check out [Svite](https://github.com/dominikg/svite) which is built on top of Vite.


## test

1. 为了练习，建议先新建文件夹，并切换至文件夹
2. 在新建的文件夹安装 vite: npm install create-vite-app --save-dev
3. 用vite创建一个新项目： npx create-vite-app vite-demo，

```
Scaffolding project in D:\00workspace\vite-demo\vite-demo...

Done. Now run:

  cd vite-demo
  npm install (or `yarn`)
  npm run dev (or `yarn dev`)
```

4. 切换文件夹：cd vite-demo, npm install
5. npm run dev


## vite原理

创建时，通过解析用户的执行命令，判断用户是需要创建哪一种模板，然后将已经准备好的模板复制到用户的项目目录下，由于.gitignore文件和package,json文件比较特殊，在复制的过程中会做一些单独的处理

访问页面时，后台通过koa创建一个服务器，浏览器发起请求，koa根据请求返回相应的内容，在返回之前会对内容进行处理，比如.vue文件

热更新部分，浏览器和koa服务器之间建立了sorket连接，后台监听文件变化，发送消息，浏览器接收消息，触发更新


## client.js

```js
// This file runs in the browser.
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.env.NODE_ENV = "development";
const defines = {"__VUE_OPTIONS_API__":true,"__VUE_PROD_DEVTOOLS__":false};
Object.keys(defines).forEach((key) => {
    const segs = key.split('.');
    let target = window;
    for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        if (i === segs.length - 1) {
            target[seg] = defines[key];
        }
        else {
            target = target[seg] || (target[seg] = {});
        }
    }
});
console.log('[vite] connecting...');
// use server configuration, then fallback to inference
const socketProtocol = null || (location.protocol === 'https:' ? 'wss' : 'ws');
const socketHost = `${null || location.hostname}:${3000}`;
const socket = new WebSocket(`${socketProtocol}://${socketHost}`, 'vite-hmr');
function warnFailedFetch(err, path) {
    if (!err.message.match('fetch')) {
        console.error(err);
    }
    console.error(`[hmr] Failed to reload ${path}. ` +
        `This could be due to syntax errors or importing non-existent ` +
        `modules. (see errors above)`);
}
// Listen for messages
socket.addEventListener('message', async ({ data }) => {
    const payload = JSON.parse(data);
    if (payload.type === 'multi') {
        payload.updates.forEach(handleMessage);
    }
    else {
        handleMessage(payload);
    }
});
async function handleMessage(payload) {
    const { path, changeSrcPath, timestamp } = payload;
    switch (payload.type) {
        case 'connected':
            console.log(`[vite] connected.`);
            break;
        case 'vue-reload':
            queueUpdate(import(`${path}?t=${timestamp}`)
                .catch((err) => warnFailedFetch(err, path))
                .then((m) => () => {
                __VUE_HMR_RUNTIME__.reload(path, m.default);
                console.log(`[vite] ${path} reloaded.`);
            }));
            break;
        case 'vue-rerender':
            const templatePath = `${path}?type=template`;
            import(`${templatePath}&t=${timestamp}`).then((m) => {
                __VUE_HMR_RUNTIME__.rerender(path, m.render);
                console.log(`[vite] ${path} template updated.`);
            });
            break;
        case 'style-update':
            // check if this is referenced in html via <link>
            const el = document.querySelector(`link[href*='${path}']`);
            if (el) {
                el.setAttribute('href', `${path}${path.includes('?') ? '&' : '?'}t=${timestamp}`);
                break;
            }
            // imported CSS
            const importQuery = path.includes('?') ? '&import' : '?import';
            await import(`${path}${importQuery}&t=${timestamp}`);
            console.log(`[vite] ${path} updated.`);
            break;
        case 'style-remove':
            removeStyle(payload.id);
            break;
        case 'js-update':
            queueUpdate(updateModule(path, changeSrcPath, timestamp));
            break;
        case 'custom':
            const cbs = customUpdateMap.get(payload.id);
            if (cbs) {
                cbs.forEach((cb) => cb(payload.customData));
            }
            break;
        case 'full-reload':
            if (path.endsWith('.html')) {
                // if html file is edited, only reload the page if the browser is
                // currently on that page.
                const pagePath = location.pathname;
                if (pagePath === path ||
                    (pagePath.endsWith('/') && pagePath + 'index.html' === path)) {
                    location.reload();
                }
                return;
            }
            else {
                location.reload();
            }
    }
}
let pending = false;
let queued = [];
/**
 * buffer multiple hot updates triggered by the same src change
 * so that they are invoked in the same order they were sent.
 * (otherwise the order may be inconsistent because of the http request round trip)
 */
async function queueUpdate(p) {
    queued.push(p);
    if (!pending) {
        pending = true;
        await Promise.resolve();
        pending = false;
        const loading = [...queued];
        queued = [];
        (await Promise.all(loading)).forEach((fn) => fn && fn());
    }
}
// ping server
socket.addEventListener('close', () => {
    console.log(`[vite] server connection lost. polling for restart...`);
    setInterval(() => {
        fetch('/')
            .then(() => {
            location.reload();
        })
            .catch((e) => {
            /* ignore */
        });
    }, 1000);
});
// https://wicg.github.io/construct-stylesheets
const supportsConstructedSheet = (() => {
    try {
        new CSSStyleSheet();
        return true;
    }
    catch (e) { }
    return false;
})();
const sheetsMap = new Map();
export function updateStyle(id, content) {
    let style = sheetsMap.get(id);
    if (supportsConstructedSheet && !content.includes('@import')) {
        if (style && !(style instanceof CSSStyleSheet)) {
            removeStyle(id);
            style = undefined;
        }
        if (!style) {
            style = new CSSStyleSheet();
            style.replaceSync(content);
            // @ts-ignore
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, style];
        }
        else {
            style.replaceSync(content);
        }
    }
    else {
        if (style && !(style instanceof HTMLStyleElement)) {
            removeStyle(id);
            style = undefined;
        }
        if (!style) {
            style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.innerHTML = content;
            document.head.appendChild(style);
        }
        else {
            style.innerHTML = content;
        }
    }
    sheetsMap.set(id, style);
}
function removeStyle(id) {
    let style = sheetsMap.get(id);
    if (style) {
        if (style instanceof CSSStyleSheet) {
            // @ts-ignore
            const index = document.adoptedStyleSheets.indexOf(style);
            // @ts-ignore
            document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== style);
        }
        else {
            document.head.removeChild(style);
        }
        sheetsMap.delete(id);
    }
}
async function updateModule(id, changedPath, timestamp) {
    const mod = hotModulesMap.get(id);
    if (!mod) {
        // In a code-spliting project,
        // it is common that the hot-updating module is not loaded yet.
        // https://github.com/vitejs/vite/issues/721
        return;
    }
    const moduleMap = new Map();
    const isSelfUpdate = id === changedPath;
    // make sure we only import each dep once
    const modulesToUpdate = new Set();
    if (isSelfUpdate) {
        // self update - only update self
        modulesToUpdate.add(id);
    }
    else {
        // dep update
        for (const { deps } of mod.callbacks) {
            if (Array.isArray(deps)) {
                deps.forEach((dep) => modulesToUpdate.add(dep));
            }
            else {
                modulesToUpdate.add(deps);
            }
        }
    }
    // determine the qualified callbacks before we re-import the modules
    const callbacks = mod.callbacks.filter(({ deps }) => {
        return Array.isArray(deps)
            ? deps.some((dep) => modulesToUpdate.has(dep))
            : modulesToUpdate.has(deps);
    });
    await Promise.all(Array.from(modulesToUpdate).map(async (dep) => {
        const disposer = disposeMap.get(dep);
        if (disposer)
            await disposer(dataMap.get(dep));
        try {
            const newMod = await import(dep + (dep.includes('?') ? '&' : '?') + `t=${timestamp}`);
            moduleMap.set(dep, newMod);
        }
        catch (e) {
            warnFailedFetch(e, dep);
        }
    }));
    return () => {
        for (const { deps, fn } of callbacks) {
            if (Array.isArray(deps)) {
                fn(deps.map((dep) => moduleMap.get(dep)));
            }
            else {
                fn(moduleMap.get(deps));
            }
        }
        console.log(`[vite]: js module hot updated: `, id);
    };
}
const hotModulesMap = new Map();
const disposeMap = new Map();
const dataMap = new Map();
const customUpdateMap = new Map();
export const createHotContext = (id) => {
    if (!dataMap.has(id)) {
        dataMap.set(id, {});
    }
    // when a file is hot updated, a new context is created
    // clear its stale callbacks
    const mod = hotModulesMap.get(id);
    if (mod) {
        mod.callbacks = [];
    }
    const hot = {
        get data() {
            return dataMap.get(id);
        },
        accept(callback = () => { }) {
            hot.acceptDeps(id, callback);
        },
        acceptDeps(deps, callback = () => { }) {
            const mod = hotModulesMap.get(id) || {
                id,
                callbacks: []
            };
            mod.callbacks.push({
                deps: deps,
                fn: callback
            });
            hotModulesMap.set(id, mod);
        },
        dispose(cb) {
            disposeMap.set(id, cb);
        },
        // noop, used for static analysis only
        decline() { },
        invalidate() {
            location.reload();
        },
        // custom events
        on(event, cb) {
            const existing = customUpdateMap.get(event) || [];
            existing.push(cb);
            customUpdateMap.set(event, existing);
        }
    };
    return hot;
};
```
