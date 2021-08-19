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

let inEnum = false;
let enumStack = [];

let inMessage = false;
let messageStack = [];
// let messageObjStack = [];
let currentMessage = {};


// enum,message,service等的匹配过程中，尽量不要用replace，防止变量名中有相同字段
rl.on('line', (line) => {
    var str = line.trim();
    if(str !== '' && !str.startsWith('//')){
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
                inMethod = true;
            }
        }
        // enum
        else if(/^enum\s+\w+\s+{$/.test(str)){
            // enum Market {
            const enumName = str.slice(4).replace('{', '').trim();
            enumStack.push(enumName);
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
                const enumName = enumStack[enumStack.length - 1];
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
            if(['uinit32', 'uinit64', 'init32', 'init64'].includes(dataType)){
                dataType = 'number';
            }else if(dataType === 'bool'){
                dataType = 'boolean'
            }
            currentMessage[key] = {
                type: dataType,
                optional: optional,
            }
        }
        else if(str === '}'){
            if(inMethod){
                inMethod = false;
            }else if(inService){
                inService = false;
            }else if(inEnum){
                inEnum = false;
                enumStack.pop();
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
//   console.log("读取完毕！");
//   console.log('proto', proto);
//   console.log('service', service);
//   console.log('enum', enums);
//   console.log('data', data);
    console.log('message', JSON.stringify(message));
});
