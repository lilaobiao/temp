```js
const path = require('path');
const pb = require('protobufjs');
const cache = {};
const parse = function (filepath) {
    return new Promise((resolve, reject) => {
        const absolutePath = path.resolve(filepath);
        if (cache[absolutePath]) {
            resolve(cache[absolutePath]);
            return;
        }
        pb.load(absolutePath, (err, root) => {
            if (err) {
                reject(err);
                return;
            }
            cache[absolutePath] = root;
            resolve(root);
        });
    });
};

const pbpath = path.join(__dirname, 'test2.proto');

parse(pbpath).then(res => {
    // console.log(res.nested.BondFrmViewService);
    // console.log(res.nested.BondFrmViewService.methods);
    console.log(JSON.stringify(res.nested));
}).catch(err=>{
    console.log(err);
})



message Test {
    optional int64  key1    = 1[use=TestEnum,default=1];
    optional string key2    = 2[format="YYYY-MMM-DD",default="2021-01-01"];
}
```
