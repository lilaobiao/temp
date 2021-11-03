const Mock = require('mockjs');
const Random = Mock.Random;

const randomFloat = Array.from({length: 100}).map(() => {
    return Random.integer(1, 100) + Random.integer(10, 99)* 0.01;
});
const randomString = Array.from({length: 30}).map(() => {
    return Random.string('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz0123456789', 4, 10)
});

// 扩展random
Mock.Random.extend({
    randomFloats: randomFloat,
    //自定义占位符名字tags
    floatArr: function (min = 2, max = 5) {
       //随机选择min, max个作为返回值
       return this.pick(this.randomFloats, min, max);
    },
    randomStrings: randomString,
    stringArr: function (min = 2, max = 5) {
        return this.pick(this.randomStrings, min, max);
    }
});

const protoNumberTypes = [
    'int32',
    'int64',
    'uint32',
    'uint64',
    'sint32',
    'sint64',
    'fixed32',
    'fixed64',
    'sfixed32',
    'sfixed64',
    'double',
];
const protoStringTypes = [
    'string',
    'bytes',
];
const protoFloatType = 'float';
const protoBoolType = 'bool';

// 获取枚举类型的值
function getEnumData(type, innerMessage, service){
    const obj = innerMessage[type] || service[type] || {};
    const arr = [];
    // enum对象具有values属性，里面的值跟proto中对应
    let values = obj.values;
    if(values){
        Object.keys(values).forEach(key => {
            arr.push(values[key]);
        });
    }
    return arr;
}

function getDefault(options, value){
    if(typeof options === 'object' && options.default !== undefined){
        return options.default;
    }
    return value;
}

function generateMockTemplate(message, service){
    const fields = message.fields;
    const keys = Object.keys(fields);
    const data = {};
    const innerMessage = message.nested || {};
    // float随机数
    keys.forEach(key => {
        const valueDesc = fields[key];

        const type = valueDesc.type;
        const options = valueDesc.options;
        
        let newKey = key;
        let value;
        let isRepeated = valueDesc.rule === 'repeated';
        
        if(protoNumberTypes.includes(type)){
            value = '@integer(1,100)';
            if(isRepeated){
                value ='@range(2, 10)';
            }

            // 看是否指定了枚举类型
            let enumData = [];
            if(options && options.use){
                const enumType = options.use;
                enumData = getEnumData(enumType, innerMessage, service);
                // 如果是指定了使用某个枚举类型，只使用枚举类型中的值
                if(enumData.length){
                    value = enumData;

                    newKey = `${key}|1`;
                    if(isRepeated){
                        newKey = `${key}|1-2`;
                    }
                }
            }
        }else if(protoFloatType === type){
            value = '@float(0,100,1,3)';
            if(isRepeated){
                value = '@floatArr';
            }
        }else if(protoStringTypes.includes(type)){
            value = `mock ${key}`;
            if(isRepeated){
                value = '@stringArr';
            }
        }else if(protoBoolType === type){
            newKey = `${key}|1-2`; // true的概率为1/2
            value = true;
            if(isRepeated){
                newKey = `${key}|1-2`;
                value = [true, false, true];
            }
        }else{
            if(innerMessage[type]){
                value = generateMockTemplate(innerMessage[type], service);
            }else if(service[type]){
                value = generateMockTemplate(service[type], service);
            }else{// 避免属性不存在
                value = 'data type not defined';
            }
            if(isRepeated){
                newKey = `${key}|2-5`;
                value = [value];
            }
        }
        if(key === 'errorCode'){
            console.log('errorCode', options);
        }
        // 如果有设置default且不是repeated
        if(!isRepeated){
            value = getDefault(options, value);
        }
        data[newKey] = value;
    });

    return data;
}

module.exports = function(message, service){
    const dataModel = generateMockTemplate(message, service);
    return Mock.mock(dataModel);
}
