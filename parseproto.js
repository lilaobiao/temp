const readline = require('readline');
const path = require('path');
const fs = require('fs');
let filepath = path.join(__dirname, "test.proto");

let input = fs.createReadStream(filepath);

const rl = readline.createInterface({
  input: input
});

const proto = {};
const enums = {};
const service = {};
const data = {};
const message = {};


let inService = false;
let inMethod = false;
let currentMethodName = '';

let inEnum = false;
let currentEnumName = '';

let inMessage = false;
let messageStack = [];
let currentMessage = {};


// enum,message,service等的匹配过程中，尽量不要用replace，防止变量名中有相同字段
rl.on('line', (line) => {
    var str = line.trim();
    if(str !== '' && !str.startsWith('//')){
        // console.log(str);
        // 去除注释部分
        if(str.includes('//')){
            str = str.split('//')[0].trim();
        }

        // service
        if(/^service\s+\w+\s+{$/.test(str)){
            // service BondFrmViewService {
            proto.serviceName = str.slice(7).replace('{', '').trim();
            inService = true;
        }
        else if(/^rpc\s+\w+\s*\(\w+\)\s*returns\s*\(\w+\)\s*{$/.test(str)){
            // rpc QueryClientPortfolio (QueryClientPortfolioReq) returns (QueryClientPortfolioRsp) {
            // rpc QueryClientPortfolio(QueryClientPortfolioReq)returns(QueryClientPortfolioRsp){
            if(inService){
                // const lineData = str.replace(/\(|\)/g, '').replace(/\s+/g, ' ').split(' ');
                // console.log(lineData);
                // 得到rpc空格后面的部分，并去掉所有空格
                let text = str.slice(3).replace(/\s+/g, '');
                const arr = text.split('(');
                const method = arr[0];//QueryClientPortfolio
                const req = arr[1].split(')')[0];//QueryClientPortfolioReq)returns
                const res = arr[2].split(')')[0];//QueryClientPortfolioRsp){
                data[req] = {};
                data[res] = {};
                service[method] = {
                    reqData: req,
                    resData: res
                }
                currentMethodName = method;
                inMethod = true;
            }
        }
        else if(/^option\s*\(srpc.(service|method)_option_id\)\s*=\s*0x\d+\s*;$/.test(str)){
            // option (srpc.service_option_id) = 0x9999999;
            // option (srpc.method_option_id) = 0x1;
            const value = str.split('=')[1].split(';')[0].trim();
            // 先满足method
            if(inMethod){
                if(service[currentMethodName]){
                    service[currentMethodName].methodId = value;
                }
            }else if(inService){
                proto.serviceId = value;
            }
        }
        // enum
        else if(/^enum\s+\w+\s+{$/.test(str)){
            // enum Market {
            const enumName = str.slice(4).replace('{', '').trim();
            currentEnumName = enumName;
            enums[enumName] = {};
            inEnum = true;
        }
        // /^\w+\s*=\s*\d+;(\s*\/{2}[\s\S]*)?$/
        else if(/^\w+\s*=\s*\d+;$/.test(str)){
            // BUY_AMOUNT  = 1;    // 债券买入金额
            // 暂时不考虑常量值为字符串的情况
            if(inEnum){
                const arr = str.split('=');
                const name = arr[0].trim();
                // 去掉最后的 ; 号
                let value = arr[1].slice(0, -1).trim();
                if(!isNaN(+value)){
                    value = +value;
                }
                const enumName = currentEnumName;
                enums[enumName][name] = value;
            }
        }
        // message存在嵌套
        else if(/^message\s+\w+\s+{$/.test(str)){
            // message StatementInfoListRsp {
            const messageName = str.slice(7).replace('{', '').trim();
            if(messageStack.length){
                currentMessage.innerMessages = currentMessage.innerMessages || {};
                currentMessage.innerMessages[messageName] = {};
                currentMessage = currentMessage.innerMessages[messageName];
                messageStack.push(messageName);
            }else{
                // 最外层message
                messageStack.push(messageName);
                message[messageName] = {};
                inMessage = true;
                currentMessage = message[messageName];
            }
        }
        else if(/^(optional|repeated|required)\s+\w+\s+\w+\s*=\s*\d+\s*;$/.test(str)){
            // optional bool is_month = 2;
            // optional bool is_month = 2[default=500];
            // optional bool is_month=2[default=false];
            let text = str.slice(0, -1).trim().replace(/\s+/g, ' ');//optional bool is_month = 2
            text = text.split('=')[0].trim();//optional bool is_month
            let [optional, dataType, key] = text.split(' ');
            if(['uint32', 'uint64', 'int32', 'int64'].includes(dataType)){
                dataType = 'number';
            }else if(dataType === 'bool'){
                dataType = 'boolean'
            }
            key = key.replace(/(_[a-z])/g, $1=>$1.slice(1).toUpperCase());
            currentMessage[key] = {
                type: dataType,
                optional: optional,
            }
        }
        else if(str === '}'){
            if(inMethod){
                currentMethodName = '';
                inMethod = false;
            }else if(inService){
                inService = false;
            }else if(inEnum){
                inEnum = false;
                currentEnumName = '';
            }else if(inMessage){
                // message存在嵌套的情况
                if(messageStack.length === 1){
                    inMessage = false;
                }else{ // currentMessage往外走一层
                    let len = messageStack.length - 2;
                    let i = 0;
                    let temp = message[messageStack[0]];
                    while(i < len){
                        temp = temp.innerMessages;
                        i++;
                        temp = temp[messageStack[i]];
                    }
                    currentMessage = temp;
                }
                messageStack.pop();
            }
        }
    }
});

rl.on('close', (line) => {
    console.log("读取完毕！");
    proto.methods = service;
    proto.enums = enums;
    proto.messages = message;
    console.log('message', JSON.stringify(proto));
});

/////////////////////////////////////////////////////////////////////////////////////////////

第二部分

"GetDailyRemittanceRsp": {
            "innerMessages": {
                "RemittanceAmount": {
                    "innerMessages": {
                        "RemittanceAmount2": {
                            "market": {
                                "type": "number",
                                "optional": "optional"
                            },
                            "buyCash": {
                                "type": "string",
                                "optional": "optional"
                            },
                            "remittanceAmount_3": {
                                "type": "RemittanceAmount3",
                                "optional": "optional"
                            },
                            "remittanceAmount_4": {
                                "type": "RemittanceAmount4",
                                "optional": "optional"
                            },
                            "innerMessages": {
                                "RemittanceAmount3": {
                                    "market": {
                                        "type": "number",
                                        "optional": "optional"
                                    },
                                    "buyCash": {
                                        "type": "string",
                                        "optional": "optional"
                                    },
                                    "tradeDate": {
                                        "type": "string",
                                        "optional": "optional"
                                    },
                                    "remitDate": {
                                        "type": "string",
                                        "optional": "optional"
                                    }
                                },
                                "RemittanceAmount4": {
                                    "market": {
                                        "type": "number",
                                        "optional": "optional"
                                    },
                                    "buyCash": {
                                        "type": "string",
                                        "optional": "optional"
                                    },
                                    "tradeDate": {
                                        "type": "string",
                                        "optional": "optional"
                                    },
                                    "remitDate": {
                                        "type": "string",
                                        "optional": "optional"
                                    }
                                }
                            }
                        },
                        "RemittanceAmount5": {
                            "market": {
                                "type": "number",
                                "optional": "optional"
                            },
                            "buyCash": {
                                "type": "string",
                                "optional": "optional"
                            },
                            "tradeDate": {
                                "type": "string",
                                "optional": "optional"
                            },
                            "remitDate": {
                                "type": "string",
                                "optional": "optional"
                            }
                        }
                    },
                    "market": {
                        "type": "number",
                        "optional": "optional"
                    },
                    "buyCash": {
                        "type": "string",
                        "optional": "optional"
                    },
                    "remittanceAmount_2": {
                        "type": "RemittanceAmount2",
                        "optional": "optional"
                    },
                    "remittanceAmount_5": {
                        "type": "RemittanceAmount5",
                        "optional": "optional"
                    }
                }
            },
            "result": {
                "type": "number",
                "optional": "optional"
            },
            "errMsg": {
                "type": "string",
                "optional": "optional"
            },
            "remittances": {
                "type": "RemittanceAmount",
                "optional": "repeated"
            },
            "date": {
                "type": "string",
                "optional": "optional"
            }
        },
/////////////////////////////////////////////////////////////////////////////////////////////
const mock = require('mockjs');
const random = mock.Random;

const proto = require('./proto.json');
// console.log(proto.serviceName, random.cname());

var GetDailyRemittanceRsp = proto.messages.GetDailyRemittanceRsp;

function generateData(message, proto){
    var innerMessage = message.innerMessages;
    const data = {}; 
    Object.keys(message).filter(key => key !== 'innerMessages').forEach(key => {
        const valueDesc = message[key];
        let value;
        switch(valueDesc.type){
            case 'string':
                value = random.cword();
                break;
            case 'number':
                value = random.integer();
                break;
            case 'boolean':
                value = random.boolean();
                break;
            default:
                value = generateObjValue(valueDesc, innerMessage, proto);
        }
        // 数组
        if(valueDesc.optional === 'repeated'){
            data[key] = [value];
        }else{
            data[key] = value;
        }
    });
    return data;
};


function generateObjValue(valueDesc, innerMessages, proto){
    const type = valueDesc.type;
    console.log(innerMessages, type);
    if(innerMessages && innerMessages[type]){
        return generateData(innerMessages[type], proto);
    }
    // 避免属性不存在
    else if(proto[type]){
        return generateData(proto[type], proto);
    }else{
        return 'data type not defined';
    }
}


console.log(JSON.stringify(generateData(GetDailyRemittanceRsp, proto)));

// Mock.mock('http://www.bai.com',{
//     'firstName|3':'fei',//重复fei这个字符串 3 次，打印出来就是'feifeifei'。
//     'lastName|2-5':'jiang',//重复jiang这个字符串 2-5 次。
//     'big|+1':0, //属性值自动加 1，初始值为 0
//     'age|20-30':25,//生成一个大于等于 20、小于等于 30 的整数，属性值 25 只是用来确定类型
//     'weight|100-120.2-5':110.24,//生成一个浮点数,整数部分大于等于 100、小于等于 120，小数部分保留 2 到 5 位。
//     'likeMovie|1':Boolean,//随机生成一个布尔值，值为 true 的概率是 1/2，值为 false 的概率同样是 1/2。
//     'friend1|1':arr,//从数组 arr 中随机选取 1 个元素，作为最终值。
//     'friend2|+1':arr,//从属性值 arr 中顺序选取 1 个元素，作为最终值
//     'friend3|2-3':arr,//通过重复属性值 arr 生成一个新数组，重复次数大于等于 2，小于等于 3。
//     'life1|2':obj,//从属性值 obj 中随机选取 2 个属性
//     'life1|1-2':obj,//从属性值 obj 中随机选取 1 到 2 个属性。
//     'regexp1':/^[a-z][A-Z][0-9]$/,//生成的符合正则表达式的字符串
// })
