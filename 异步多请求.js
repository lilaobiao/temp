const testService = {
    testMethod(params){
        return new Promise((resolve, reject) => {
            console.log('testMethod', params)
            setTimeout(() => {
                if(params.page === 8){
                    resolve({
                        result: 1,
                        list: [{
                            name: 'test',
                            page: params.page
                        }],
                        total: params.total
                    })
                }else if(params.page === 7){
                    reject({
                        result: 1,
                        page: params.page,
                        message: 'reject errmeg'
                    })
                }else{
                    resolve({
                        result: 0,
                        list: [{
                            name: 'test',
                            page: params.page
                        }],
                        total: params.total
                    })
                }
            }, 50);
        })
    }
}

// 模拟ctx上下文
const ctx = {
    user: {
        uid: 6482,
        sig: null,
        nick: ''
    },
    getRealHost: () => '',// ''
    getClientIp: () => null,// null,国内预发布环境的ip
    logger: {
        error: console.log.bind(console),
        notice: console.log.bind(console),
    }
};

const getDataMultipleTimes = async function (service, method, params, options){
    const defaultOptions = {
        ctx: null,
        pageKey: 'page', // page变量字段
        pageSize: 1, // 每次请求多少条数据
        startIndex: 1, // 开始索引，有的是1，有的是0
        successCondition: ['result', 0], // 判断请求成功的条件
        resultTotalKey: 'total',
        resultListKey: 'list', // 获取列表数据的字段
        allowConcurrency: true, // 是否允许并发
        concurrencyMax: Number.POSITIVE_INFINITY
    };
    const {
        ctx,
        pageKey, // page变量字段
        pageSize,
        startIndex, // 开始索引，有的是1，有的是0
        resultTotalKey,
        resultListKey, // 获取列表数据的字段
        allowConcurrency,
        successCondition,
        concurrencyMax
    } = Object.assign(defaultOptions, options);
    const [successKey, successValue] = successCondition;
    // 需要请求的次数
    let times = 1;
    let allTimes = 1;

    let allData = [];
    let isFirst = true;
    try{
        if(!allowConcurrency){
            params[pageKey] = startIndex;
            while (times <= allTimes) {
                const result = await service[method](params);
                console.log('\r\n while', params, result);
                if(result[successKey] !== successValue){
                    // params[pageKey] = times + 1;
                    // throw result之后，循环自动终止
                    throw result;
                }
                allData = allData.concat(result[resultListKey]);
                params[pageKey] += 1;
                times += 1;
                if (isFirst) {
                    // 第一次取数据时，通过返回的totalNum计算需要下载的总次数
                    const total = Number(result[resultTotalKey]);
                    allTimes = Math.ceil(total / pageSize);
                    isFirst = false;
                }
            }
            return allData;
        }else{
            params[pageKey] = startIndex;
            const result = await service[method](params);
            if(result[successKey] !== successValue){
                throw result;
            }

            const total = Number(result[resultTotalKey]);
            allData = allData.concat(result[resultListKey]);
            allTimes = Math.ceil(total / pageSize);
            if(allTimes === 1){
                return allData;
            }
            
            // 需要请求多次
            allTimes -= 1;
            const requestAarr = [];
            const getData = async function(params){
                return await service[method](params)
            }
            for(let i = 0; i < allTimes; i++){
                console.log('\r\nfor 循环请求参数', params);
                requestAarr.push(getData({
                    ...params,
                    [pageKey]: params[pageKey] + i + 1
                }));
            }
            let results = [];
            // 如果需要请求的次数大于最高并发数
            console.log('allTimes', allTimes, 'concurrencyMax', concurrencyMax);
            if(allTimes > concurrencyMax){
                const promiseTimes = Math.ceil(allTimes / concurrencyMax);
                // 分批次逐步请求
                for(let j = 0; j < promiseTimes; j++){
                    console.log('promiseTimes', j);
                    const timeRequests = requestAarr.slice(j * concurrencyMax, (j + 1) * concurrencyMax)
                    const timeResult = await Promise.all(timeRequests);
                    console.log('promiseTimes', timeResult.list);
                    results = results.concat(timeResult);
                }
            }else{
                results = await Promise.all(requestAarr);
            }
            for(let i = 0; i < results.length; i++){
                const result = results[i];
                if(result[successKey] === successValue){
                    allData = allData.concat(result[resultListKey]);
                }else{
                    throw result;
                }
            }
            return allData;
        }
    }catch(err){
        // 确定的错误
        // 1.await的时候出错了，这里能捕捉到，也能抛出去
        // 2.throw的result，这里能捕获到，也能抛出去
        // pageSize 测试通过
        console.log('\r\n allowConcurrency err', err);
        throw err;
    }
};

const test = async function(allowConcurrency){
    let startTime = Date.now();
    try{
        const params = {
            total: 11,
            pageSize: 2,
        }
        const options = {
            pageKey: 'page',
            pageSize: 2,
            startIndex: 0,
            allowConcurrency: allowConcurrency,
            concurrencyMax: 2,
        }
        const data = await getDataMultipleTimes(
            testService,
            'testMethod',
            params,
            options
        );
        console.log('\r\nall data', data);
        console.log(Date.now() - startTime);
    }catch(err){
        console.log('\r\ntest err', err);
        console.log(Date.now() - startTime);
    }
}

test(true);




const getDeepValue = function(obj, keys){
    const keyArr = keys.split('.');
    let value = obj[keyArr.shift()];
    while(value && keyArr.length){
        value = value[keyArr.shift()];
    }
    return value;
}

const getDataMultipleTimes = async function (method, params, requestOptions, resultOptions){
    const {
        methodCtx,
        restParams,
        pageKey,
        pageSize,
        pageStart,
        allowConcurrency,
        concurrencyMax,
        paramsPosition,
    } = Object.assign({
        methodCtx: null, // 请求方法执行的上下文
        restParams: [], // 请求方法传递的剩余参数
        paramsPosition: 0, // params参数位置
        pageKey: 'page', // page变量字段
        pageSize: 1, // 每次请求多少条数据
        pageStart: 1, // 开始索引，有的是1，有的是0
        allowConcurrency: true, // 是否允许并发
        concurrencyMax: Number.POSITIVE_INFINITY // 单次请求最大并发量
    }, requestOptions);

    const {
        resultTotalKey,
        resultListKey,
        successCondition,
    } = Object.assign({
        successCondition: ['result', 0], // 判断请求成功的条件
        resultTotalKey: 'total', // 获取列表总数的字段
        resultListKey: 'list', // 获取列表数据的字段
    }, resultOptions);
    const [successKey, successValue] = successCondition;

    // const requestData = method.bind(methodCtx);

    
    // 请求函数，每请求一次，pageKey自动加1
    let reqPage = pageStart - 1;
    const requestData = async function(){
        const reqParams =  {
            ...params,
            [pageKey]: ++reqPage
        }
        const finallyParams = [
            ...restParams.slice(0, paramsPosition),
            reqParams,
            ...restParams.slice(paramsPosition)
        ];
        return await method.call(methodCtx, ...finallyParams);
    }

    // 处理请求结果
    let allData = [];
    const handleResult = function(result){
        if(getDeepValue(result, successKey) !== successValue){
            throw result;
        }
        allData = allData.concat(getDeepValue(result, resultListKey));
    }
    

    try{
        params[pageKey] = pageStart;
        // const finallParams = getFinallyParams(params, restParams, paramsPosition);
        // const result = await requestData(...finallParams);
        const result = await requestData();
        handleResult(result);

        const total = Number(getDeepValue(result, resultTotalKey));
        // 需要请求的次数
        let allTimes = Math.ceil(total / pageSize);
        if(allTimes === 1){
            return allData;
        }

        // 需要请求多次
        if(!allowConcurrency){
            while(--allTimes > 0){
                // params[pageKey] += 1;
                // const finallParams = getFinallyParams(params, restParams, paramsPosition);
                // const result = await requestData(...finallParams);
                const result = await requestData();
                // if(getDeepValue(result, successKey) !== successValue){
                //     throw result; // throw result之后，循环自动终止
                // }
                // allData = allData.concat(getDeepValue(result, resultListKey));
                handleResult(result);
            }
            return allData;
        }else{
            let results = [];
            // 如果需要请求的次数大于最高并发数
            if(--allTimes > concurrencyMax){
                const promiseTimes = Math.ceil(allTimes / concurrencyMax);
                // 分批次逐步请求
                for(let j = 0; j < promiseTimes; j++){
                    const requestArr = [];
                    for(let i = 0; i < concurrencyMax && allTimes > 0; i++){
                        allTimes--;
                        // const currentPage = j * concurrencyMax + i + 1;
                        // const finallParams = getFinallyParams(
                        //     {...params,[pageKey]: params[pageKey] + currentPage},
                        //     restParams,
                        //     paramsPosition
                        // );
                        // console.log('finallParams', finallParams);
                        // requestArr.push(requestData(...finallParams));
                        requestArr.push(requestData());
                    }
                    const timeResult = await Promise.all(requestArr);
                    results = results.concat(timeResult);
                }
            }else{
                const requestArr = [];
                for(let i = 0; i < allTimes; i++){
                    // const finallParams = getFinallyParams(
                    //     {...params,[pageKey]: params[pageKey] + i + 1},
                    //     restParams,
                    //     paramsPosition
                    // );
                    // console.log('finallParams', finallParams);
                    // requestArr.push(requestData(...finallParams));
                    requestArr.push(requestData());
                }
                results = await Promise.all(requestArr);
            }
            // for(let i = 0; i < results.length; i++){
            //     const result = results[i];
            //     // if(getDeepValue(result, successKey) !== successValue){
            //     //     throw result;
            //     // }
            //     // allData = allData.concat(getDeepValue(result, resultListKey));
            //     handleResult(result);
            // }
            results.forEach(handleResult);
            return allData;
        }
    }catch(err){
        // 确定的错误
        // 1.await的时候出错了，这里能捕捉到，也能抛出去
        // 2.throw的result，这里能捕获到，也能抛出去
        // pageSize 测试通过
        console.log('\r\n allowConcurrency err', err);
        throw err;
    }
};

const test = async function(allowConcurrency){
    let startTime = Date.now();
    try{
        const params = {
            total: 20,
            pageSize: 2,
        }
        const requestOptions = {
            pageKey: 'page',
            pageSize: 2,
            pageStart: 1,
            allowConcurrency: allowConcurrency,
            concurrencyMax: 2,
            methodCtx: testService,
            restParams: [{}, '自定义测试参数'],
            paramsPosition: 1,
        }
        const data = await getDataMultipleTimes(
            testService.testMethod,
            params,
            requestOptions
        );
        console.log('\r\nall data', data);
        console.log(Date.now() - startTime);
    }catch(err){
        console.log('\r\ntest err', err);
        console.log(Date.now() - startTime);
    }
}

test(true);

// 剩余参数是可以的
// function aa(...params){
//     console.log(params); // [1, 2, 3, 4]
// }
// aa(1, ...[2,3,4]);

// 异步方法通过bind能改变this指向

function testThrowErrInForEach(){
    const inner = function(i){
        if(i === 3){
            throw i
        }else{
            console.log(i);
        }
    };
    try{
        
        [1,2,3,4,5].forEach(inner);
    }catch(err){
        console.log(err)
    }
}
// testThrowErrInForEach(); // 1,2,3
