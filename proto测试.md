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




var Mock = require('mockjs');
const mock = function(proto, serviceName, methodName){
    const service = proto[serviceName] || {methods: {}};
    const method = service.methods[methodName];
    if(!method){
        return {
            code: -1,
            message: `${serviceName}.${methodName} does not exist`
        }
    }
    const resType = method.responseType;
    const messgae = proto[resType];
    const messgaeTemplate = generateData(messgae, proto);
    console.log(JSON.stringify(messgaeTemplate));
    // console.log(Mock.mock(messgaeTemplate));
}


function generateData(messgae, proto){
    const templateObj = {};
    const {fields, nested = {}} = messgae;
    Object.keys(fields).forEach(key => {
        const fieldDesc = fields[key];
        let {value, isEnum} = generateValue(key, fieldDesc, nested, proto);
        let newKey = key;
        // 如果是数组
        if(fieldDesc.rule === 'repeated'){
            newKey += '|2-5';
            value = [value];
        }
        // 枚举类型，按照顺序每次显示一个元素
        else if(Array.isArray(value)){
            newKey += '|+1';
        }
        // 布尔类型，让返回true的概率为1/2
        else if(typeof value === 'boolean'){
            newKey += '|1';
        }
        // number类型的值
        // else if(typeof value === 'number'){
        //     // 整数
        //     if(value === 1){
        //     }else{// 小数
        //     }
        // }
        templateObj[newKey] = value;
    })
    return templateObj;
}

function generateValue(key, fieldDesc, nested, proto){
    const {type, options} = fieldDesc;
    let value;
    let isEnum = false;
    let jsType = key.toLowerCase();
    // 基本类型
    if(['string', 'float', 'bool', 'int32', 'int64', 'uint32', 'uint64'].includes(type)){
        if(options){
            if(options.default){
                value = options.default;
            }else if(options.use){
                const useType = options.use;
                const useData = nested[useType] ? nested[useType] : proto[useType];
                if(useData.values){
                    isEnum = true;
                    value = Object.keys(useData.values).map(enumKey => useData.values[enumKey]);
                }else{
                    value = generateData(useData, proto);
                }
            }else if(options.format){
                value = options.format;
                // 除了正则，其他的不处理
                if(value.startsWith('^') && value.endsWith('$')){
                    value = new RegExp(value);
                }
            }
        }else{
            switch(type){
                case 'int32':
                case 'int64':
                case 'uint32':
                case 'uint64':
                    value = 1;
                    jsType = 'integer';
                    break;
                case 'float':
                    value = 1.1;
                    jsType = 'float';
                    break;
                case 'bool':
                    jsType = 'boolean';
                    value = true;
                    break;
                default:
                    jsType = 'string';
                    value = key;
            }
        }
    }else{
        const useData = nested[type] ? nested[type] : proto[type];
        if(useData.values){
            isEnum = true;
            value = Object.keys(useData.values).map(enumKey => useData.values[enumKey]);
        }else{
            value = generateData(useData, proto);
        }
    }

    return {
        value,
        isEnum,
        jsType
    }
}

// 生成复杂的数据
// function generateComplexValue(messageData, proto){
//     if(messageData.values){
//         return Object.keys(messageData.values).map(enumKey => messageData.values[enumKey]);
//     }else{
//         return generateData(messageData, proto);
//     }
// }

// mock(proto, 'BondFrmViewService', 'GetAmountReconciliation');
// mock(proto, 'BondFrmViewService', 'GetDailyRemittance');

console.log(Mock.mock({
    data: '@date',
    time: '@time',
    'natural|2-3': '@natural',
    'integer|1': '@integer',
    float: '@float',
    url: '@url',
    // date数据
    abc: /^20\d{2}(0[1-9]|1[1-2])[012][1-8]$/
}))
```
