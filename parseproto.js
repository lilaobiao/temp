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

/*
// import "srpc.proto";
option cc_generic_services = true;
option py_generic_services = true;

service TestParseService {
    option (srpc.service_option_id) = 0x9999999;    // 命令字ID

    // 获取
    rpc GetDailyRemittance (GetDailyRemittanceReq) returns (GetDailyRemittanceRsp) {
        option (srpc.method_option_id) = 0x1; // 子命令字ID
    }

    // 
    rpc GetAmountReconciliation (GetAmountReconciliationReq) returns (GetAmountReconciliationRsp) {
        option (srpc.method_option_id) = 0x2;
    }

    // 获取
    rpc GetPositionReconciliation (GetPositionReconciliationReq) returns (GetPositionReconciliationRsp) {
        option (srpc.method_option_id) = 0x3;
    }
}

// xxx
enum RspCode {
    RSP_CODE_SUCC               = 0;    // xxx
    RSP_CODE_NO_SNAPSHOT        = 1;    // xxx
    RSP_CODE_TIME_CHECK_FAILED  = 2;    // xxx
    RSP_CODE_INNER_ERROR        = -1;   // xxx
}

// xxx
enum Market {
    MARKET_HK_FUND      = 13;   // xxx
    MARKET_US_FUND      = 23;   // xxx
}

enum AmountType {
    BUY_AMOUNT  = 1;    // xxx
    BUY_FEE     = 2;    // xxx
    SELL_AMOUNT = 3;    // xxx
    SELL_FEE    = 4;    // xxx
}

enum BuySell {
    BUY     = 1;    // 买入
    SELL    = 2;    // 卖出
}

enum UpstreamType {
    SAXO = 1;
    IFAST = 2;
}

// xxx
message GetDailyRemittanceReq {
    optional string date    = 1;    // xxx
}

// 获取
message GetDailyRemittanceRsp {
    message RemittanceAmount1 {
        optional int64  market      = 1;    // xxx
        optional string buy_cash    = 3;    // xxx
        optional string trade_date  = 4;    // xxx
        optional string remit_date  = 5;    // xxx

        message RemittanceAmount2 {
            optional int64  market      = 1;    // xxx
            optional string buy_cash    = 3;    // xxx
            optional string trade_date  = 4;    // 交易日, 2020-01-01
            optional string remit_date  = 5;    // xxx

            message RemittanceAmount3 {
                optional int64  market      = 1;    // 市场ID，见Market枚举
                optional string buy_cash    = 3;    // xxx
                optional string trade_date  = 4;    // xxx
                optional string remit_date  = 5;    // xxx
            }

            message RemittanceAmount4 {
                optional int64  market      = 1;    // xxx
                optional string buy_cash    = 3;    // xxx
                optional string trade_date  = 4;    // xxx
                optional string remit_date  = 5;    // xxx
            }
        }

        message RemittanceAmount5 {
            optional int64  market      = 1;    // xxx
            optional string buy_cash    = 3;    // xxx
            optional string trade_date  = 4;    // xxx
            optional string remit_date  = 5;    // xxx

            message RemittanceAmount6 {
                optional int64  market      = 1;    // xxx
                optional string buy_cash    = 3;    // xxx
                optional string trade_date  = 4;    // xxx
                optional string remit_date  = 5;    // xxx
            }

            message RemittanceAmount7 {
                optional int64  market      = 1;    // xxx
                optional string buy_cash    = 3;    // xxx
                optional string trade_date  = 4;    // xxx
                optional string remit_date  = 5;    // xxx
            }
        }
    }

    optional int32  result  = 1;    // xxx
    optional string err_msg = 2;    // 错误信息
    repeated RemittanceAmount remittances = 3;  // xxx
    optional string date = 4;       // 请求的日期
}

// 获取请求
message GetAmountReconciliationReq {
    optional string date = 1;    // 交易日 , 20200101
}

// 获取返回
message GetAmountReconciliationRsp {
    message AmountReconciliation {
        optional int64  market              = 1;    // 市场ID，见Market枚举
        optional string buy_cash            = 3;    // xxx
        optional string broker_buy_cash     = 4;    // xxx
        optional string buy_cash_diff       = 5;    // xxx
        optional string sell_cash           = 6;    // xxx
        optional string broker_sell_cash    = 7;    // xxx
        optional string sell_cash_diff      = 8;    // xxx
        optional string trade_date          = 9;    // 交易日, 2020-01-01
        optional int64 upstream_type        = 10;   // 参考 UpstreamType
    }

    optional int64  result  = 1;        // xxx
    optional string err_msg = 2;        // xxx
    optional bool   is_confirmed = 3;   // xxx
    repeated AmountReconciliation reconciliations = 4;  // xxx
    optional string date = 5;           // xxx
}

// 获取请求
message GetPositionReconciliationReq{
    optional string  date        = 1;        // 日期, 20200101
    optional int64  market      = 2;        // 市场ID，见Market枚举
    optional int64  page_num    = 3[default=0];     //页码，从0开始
    optional int64  page_size   = 4[default=20];    // 默认20条
    optional int64 upstream_type = 5; // xxxUpstreamType
}

// 获取返回
message GetPositionReconciliationRsp {
    // 
    message PositionReconciliation{
        optional string guid              = 1;    // 比如700
        optional string broker_quantity     = 2;    // xxx
        optional string broker_settled      = 3;    // xxx
        optional string quantity            = 4;    // xxx
        optional string settled             = 5;    // xxx
        optional string quantity_diff       = 6;    // xxx
        optional string settled_diff        = 7;    // xxx
        optional string bond_name_cn        = 8;    // xxx
        optional string trade_date          = 9;    // 2020-01-01
        optional bool   maturity_flag       = 10;   // xxx
        optional string maturity_amount     = 11;   // xxx
        optional int64 upstream_type        = 12;   // xxx
        repeated Unsettled unsettled_list   = 13;   // xxx
    }

    optional int64  result  = 1;    // xxx
    optional string err_msg = 2;    // 错误信息

    optional bool   is_confirmed    = 3;   // xxx
    repeated PositionReconciliation   position_list   = 4;    //xxx
    optional int64  page_num        = 5;   // xxx
    optional int64  page_cnt        = 6;   // 总页数
    optional string date            = 7;   // 请求的日期
}

// 
message ConfirmSettleReq{
    optional string trade_date  = 1;    //yyy-交易日期, 20200101
    optional int64  oa_sid      = 2;    //
    optional string oa_name     = 3;    //
    optional int64  type        = 5;    //确认类型
    optional int64  market      = 6;    // 市场ID，见Market枚举, qqq要分市场，金额不分
}

// 
message DownloadAuditReportReq {
    optional int32     market          = 1;    // 市场ID，见Market枚举
    optional int64      date           = 2;    // 请求日期 ,直接采用自然日来请求
    optional uint32     type           = 3;    // 需下载的文件类型
}

// 
message DownloadAuditReportRsp {
    optional int64 result = 1;
    optional string err_msg = 2;
    optional bytes file_content = 3;   // 二进制的报表文件
    optional int64 page_num = 4[default=0];   // 页码
    optional int64 page_size = 5[default=20];   // 每页数量
}

message UpdateCouponNoticeTaskReq{
    optional int64 guid = 1;                  //yyy-guid
    optional uint32 estimated_value_date = 2;   //yyy-预计ddd日期
    optional uint32 delay_value_date = 3;       //若更新状态为延迟ddd，需要填延迟xxxmmm日期
    optional uint32 coupon_status = 4;          //ddd通知任务状态：11拒绝ddd 12 延迟ddd
    optional int64  oa_id       = 5;            
    optional string oa_name     = 6;            

}

message UpdateCouponNoticeTaskRsp{
    optional int32  result = 1;              //0成功，非0失败
    optional string err_msg = 2;             //失败原因
}

message ConfirmCouponDividendReq{
    optional int64 guid = 1;                  //yyy-guid
    optional uint32 record_date = 2;            //yyy-ddd登记日
    optional int64  coupon_task_id = 3;         //yyy-ddd任务的id
    optional int64  oa_id       = 4;            //确认xxxmmm
    optional string oa_name     = 5;            //确认xxxmmm

}

message ConfirmCouponDividendRsp{
    optional int32  result = 1;              //
    optional string err_msg = 2;             //失败原因
}

message CouponTaskReq{
    optional uint32 market = 1;                //市场 参考Market定义
    optional int64 guid = 2;                 //yyy-guid
    optional uint32 date_start = 3;            //yyy-
    optional uint32 date_end = 4;              //yyy-
    optional uint32 coupons_task_id = 5;       //yyy-ddd任务的id
    optional int64  page_num    = 6[default=0];     //页码，从0开始
    optional int64  page_size   = 7[default=20];    // 默认20条
    optional uint32 status = 8;                 // ddd任务状态
}

message CouponsDetailsReq{

    optional int64 guid = 1;                 //yyy-guid
    optional uint32 record_date = 2;           //ddd登记日

}

message CouponsDetailsRsp{
    message CustomerCouponDetails{
        optional uint32 market = 1;                //市场 参考Market定义
        optional uint64 uid = 2;                //yyy-，未注册游客传0即可
        optional uint64 account_id = 3;            //userid
        optional int64 guid = 4;                 //yyy-guid
        optional uint32 record_date = 5;           //xxxmmm登记日 20101018
        optional string ccy = 6;                   //xxxmmm币种
        optional string quantity = 7;              //xxxmmmqqq面值
        optional string coupons_cash = 8;          //单次xxxmmmddd金额（最新值）
        optional string coupons_cash_origin = 9;   //单次xxxmmmddd金额（原始值）
        optional uint32 has_been_changed = 10;     //是否被人工调整过
    }

    message CorporationCouponDetails {
        optional uint32 market = 1;                //xxx
        optional int32 account_type = 3;          //xxx
        optional int64 guid = 4;                 //xxx
        optional uint32 record_date = 5;           //xxx
        optional string ccy = 6;                   //xxx
        optional string quantity = 7;              //xxx
        optional string coupons_cash = 8;
    }

    optional int32  result = 1;
    optional string err_msg = 2;
    optional string total_coupons_cash = 3;
    repeated CustomerCouponDetails customer_details_list = 4;
    repeated CorporationCouponDetails corporation_details_list = 5;
}
*/
