/**
游程编码的典型题目
给定一个游程编码的数组，数组中的偶数项的值代表他的下一项在一个字符串中连续重复了多少次
例如，数组A = [3,8,0,9,2,5]开始，表示序列【8,8,8,5,5】的游程编码，这是因为序列可以表示为“3个8，0个9，2个5。


leetcode900:

编写迭代器，迭代游程编码序列。
迭代器由RLEIterator(int[] A)初始化，其中A是某些序列的游程编码。
更具体地说，对于所有偶数i, A[i]告诉我们非负整数值A[i+1]在序列中被重复的次数。

迭代器支持一个函数：next(int n)，它用尽下一个n个元素（n >= 1），然后以这种方式返回用尽的最后一个元素。
如果没有剩余元素要耗尽，则下一步返回-1。



输入：["RLEIterator","next","next","next","next"],[[3,8,0,9,2,5]],[2],[1],[2]]
输出：[null,8,8,5,-1]
解释：

RLEIterator用RLEIterator([3,8,0,9,2,5])初始化。

这对应于序列【8,8,8,5,5】
然后调用4次RLEIterator.next：

.next(2)用尽序列的2个项，返回8。剩余序列现在为【8, 5, 5】。

.next(1)用尽序列的1个项，返回8。剩余序列现在为【5, 5】。

.next(1)用尽序列的1个项，返回5。剩余序列现在为【5】。
 */

var RLEIterator = function(A) {
    this.A = A;
    this.current = 0;
};


/**
 * @param {number} n
 * @return {number}
 */
RLEIterator.prototype.next = function(n) {
    const A = this.A;
    while(this.current < A.length && A[this.current] < n){
        n = n - A[this.current];
        this.current += 2;
    }

    if(this.current >= A.length){
        return -1;
    }

    A[this.current] = A[this.current] - n; // 更新Count
    return A[this.current + 1]; // 返回element
};



// 5、最长回文串问题，找出最长回文串
// 题解：https://github.com/azl397985856/leetcode/blob/master/problems/5.longest-palindromic-substring.md

// 返回最大长度的字符串
// 同样适用于返回最大长度
var longestPalindrome = function (s) {
    // babad
    // tag : dp
    if (!s || s.length === 0) return "";
    let res = s[0];

    const dp = [];

    // 倒着遍历简化操作， 这么做的原因是dp[i][..]依赖于dp[i + 1][..]
    for (let i = s.length - 1; i >= 0; i--) {
        dp[i] = [];
        for (let j = i; j < s.length; j++) {
            if (j - i === 0) dp[i][j] = true;
            // specail case 1
            else if (j - i === 1 && s[i] === s[j]) dp[i][j] = true;
            // specail case 2
            else if (s[i] === s[j] && dp[i + 1][j - 1]) {
                // state transition
                dp[i][j] = true;
            }

            if (dp[i][j] && j - i + 1 > res.length) {
                // update res
                res = s.slice(i, j + 1);
            }
        }
    }

    return res;
};
// 个人想法，从中间往两边找，因为最长的回文串就是从中间对称，其次是靠近中间的情况


// leetcode42：装水的问题

// 思路1，两边往中间走
function trap(height){
    let left = 0, right = height.length - 1;
    let ans = 0;
    let left_max = 0, right_max = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            if(height[left] >= left_max){
                left_max = height[left];
            }else{
                ans += (left_max - height[left]);
            }
            ++left;
        } else {
            if(height[right] >= right_max){
                right_max = height[right];
            } else {
                ans += (right_max - height[right]);
            }
            --right;
        }
    }
    return ans;
}

// 思路2，同上，都是利用双指针
function trap2(height) {
    if (!height.length) return 0;
    let l = 0;
    let r = height.length - 1;
    let left_max = 0, right_max = 0;
    let ret = 0;

    while ( l < r ) {
        // 左边比右边低
        if (height[l] < height[r]) {            // right will trap
            // 最大值等于左边的较大者
            left_max = max(left_max, height[l]);
            // 加差值
            ret += left_max - height[l];
            l++;
        }
        else {                                  // left will trap
            right_max = max(right_max, height[r]);
            ret += right_max - height[r];
            r--;
        }
    }
    return ret;
}


// ------------------------------------------------------------------------
/**
不重复数字的全排列
输入: [1,2,3]
输出:
[
    [1,2,3],
    [1,3,2],
    [2,1,3],
    [2,3,1],
    [3,1,2],
    [3,2,1]
]
*/

function permute(nums, pickNum) {
    let len = nums.length;
    let res = [];
    // 如果为空
    if (len === 0) {
        return res;
    }
    // 栈,用来存储中间过程产生的结果,最后完成的结果需要拷贝到结果中
    let path = [];
    // 用来标志这个数是否被使用过
    let used = [];

    // 传入了pickNum时，表示选择其中几个
    if(pickNum && pickNum <= len) {
        len = pickNum;
    }

    // 深度优先和dfs
    // 一开始传入的深度是0
    dfs(nums, len, 0, path, used, res);
    return res;
}

function dfs(nums, len, depth, path, used, res) {
    //如果中间结果有n个数了,说明已经是一个排列了
    if (depth === len) {
        //将这个添加到结果中;
        //注意:不能添加这个引用,因为这个引用的值一直在改变,并不是你要的结果
        //你需要将这个引用的数据拷贝一份,然后添加
        res.push([...path]);
        return;
    }
    for (let i = 0; i < nums.length; i++) {
        //如果被使用
        if (!used[i]) {
            //没被使用就添加到中间结果中
            path.push(nums[i]);
            //标志为已使用
            used[i] = true;
            //继续深度优先
            dfs(nums, len, depth + 1, path, used, res);
            //返回时,删除添加的元素,标志为未被使用,回溯到之前的状态
            path.pop();
            used[i] = false;
        }
    }
}

console.log(permute([1,2,3]));
console.log(permute([1,2,3,4], 3));

// ------------------------------------------------------------------------
// 47
function find(nums){
    var permutes = [];
    var permuteList = [];
    nums.sort((a, b) => a - b);  // 排序
    var hasVisited = new Array(nums.length);
    backtracking(permuteList, permutes, hasVisited, nums);
    return permutes;
}
 
function backtracking(permuteList, permutes, visited, nums) {
    if (permuteList.length === nums.length) {
        permutes.push([...permuteList]);
        return;
    }
 
    for (let i = 0; i < visited.length; i++) {
        // i = 1时，visited = [true,0,0,0]
        // i = 2时，visited = [true,true,0,0]
        // nums = [1,2,2,3]
        // 对于重复的数字，直接continue到最后一个
        if (i != 0 && nums[i] === nums[i - 1] && !visited[i - 1]) {
            continue;  // 防止重复
        }
        if (visited[i]){
            continue;
        }
        visited[i] = true;
        permuteList.push(nums[i]);
        backtracking(permuteList, permutes, visited, nums);
        permuteList.pop();
        visited[i] = false;
    }
}

// console.log(find([1, 1, 2]));
// console.log(find([1, 1, 3]));

console.log(find([1, 2, 3, 1]));
console.log(find([1, 2, 3, 4]));


// ------------------------------------------------------------------------
/**
 * 给定一组不含重复元素的整数数组 nums，返回该数组所有可能的子集（幂集）。

说明：解集不能包含重复的子集。

示例:

输入: nums = [1,2,3]
输出:
[
  [3],
  [1],
  [2],
  [1,2,3],
  [1,3],
  [2,3],
  [1,2],
  []
]
*/

// 解法一，循环
function subsets(nums){
    let res = [];
    res.push([]);
    for(let i = 0; i < nums.length; i++){
        let len = res.length;
        for(let j = 0; j < len; j++){
            // concat返回合并后的数组，不会改变原数组  arr.concat(x,y,z) = arr.concat([x,y,z]);
            // [1,2,3].concat([1],[2],[3,4,[5]]) = [1, 2, 3, 1, 2, 3, 4,[5]]
            var newRes = res[j].concat(nums[i]);
            res.push(newRes);
        }
    }
    return res;
}

console.log(subsets([1,2,3]));
console.log(subsets([1,2,3,4]));


// 279------------------------------------------------------------------------
/**
 * 完全平方数
 * 动态规划
 */

function numSquares(n){
    // if (n <= 1) return 1;
    // dp 存储的是每个数字 i 需要多少个数相加才能得到
    var dp = Array.from({length: n + 1});   // dp表
    dp[0] = 0;

    for(let i = 1; i <= n; i++){
        var val = i; // 初始化i，至少要i个1相加
        for(var j = 1; j * j <= i; j++){
            // dp[i - j*j]表示了i-j*j最少个数再加上这一次，与val比较取最小
            val = Math.min(val, dp[i - j * j] + 1);
        }
        dp[i] = val;
    }
    console.log(dp[n]);
    return dp[n];
}

numSquares(9);
numSquares(10);
numSquares(11);
numSquares(12);



// 最大矩阵------------------------------------------------------------------------
/**
 *  给定一个无序矩阵，其中只有1和0两种值，求只含有1的最大正方形的大小。

例如给定如下矩阵:

1 0 1 0 0
1 0 1 1 1
1 1 1 1 1
1 0 0 1 0

输出4
 */

function max_square(matrix) {
    let row = matrix.length;
    let col = matrix[0].length;

    var dp = Array.from({length: row + 1}).fill(Array.from({length: col + 1}).fill(0));
    var max = 0;
    for (let i = 1; i <= row; i++){
        for (let j = 1; j <= col; j++){
            if (matrix[i-1][j-1] == '0'){
                dp[i][j] = 0;
            }else{
                dp[i][j] = Math.min.call(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) + 1;
                if (dp[i][j] > max){
                    max = dp[i][j];
                }
            }
        }
    }
    console.log(max);
    return max * max;
}

// 有问题
var arr1 = [
    [1, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0]
];

var arr2 = [
    [1, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1]
];

max_square(arr1);
max_square(arr2);


// 汉诺塔------------------------------------------------------------------------
/***   
解决汉诺塔问题的关键在于有整体思维. 假如将后一个盘子上面的所有盘子看着一个整体 Mn-1，
后一个盘子看 作Mn,这时候问题移动方式: 
1. 将Mn-1移动到y. 
2. 将Mn移动到z. 
3. 将Mn-1移动到z, 移动完毕. 于是问题变为如何将 Mn-1 从x移动到y 
这里我们在借助上面的思想将 Mn-1 拆分位Mn-2 和 Mn-1俩个部分,
将于是 原先的 z柱子看作原先的y 柱子.于是Mn-1的移动方式变为. 
1. 将Mn-2 移动到z. 
2. 将Mn-1 移动过到y. 
3. 将Mn-2 移动到y. 
不断递推直到n = 1

n 当前递归盘子数量   
a 当前递归的初始盘子所在的柱子   
b 当前递归要借用的柱子   
c 要移动到的柱子 */ 
function hanoiTower(n,a,b,c){
    // a柱上面只有一个的时候直接把a移动到c了    
    if (n == 1) {
        console.log(`${a}-->${c}`);
        return    
    }
 
    // a柱的上面的n-1个，通过c按照从小到大的规则先移动到缓冲区b。此函数进入递归。    
    hanoiTower(n-1,a,c,b)
 
    // n-1个盘子的递归移动完成之后，执行此语句，就是把a柱上的一个盘子移动到c    
    hanoiTower(1,a,b,c)
 
    // 把刚才移动到缓冲区b的n-1个，再通过a当缓冲区移动到c柱上.    
    hanoiTower(n-1,b,a,c) 
};
hanoiTower(4,'A','B','C')
// A-->B
// A-->C
// B-->C
// A-->B
// C-->A
// C-->B1
// A-->B
// A-->C
// B-->C
// B-->A
// C-->A
// B-->C
// A-->B
// A-->C
// B-->C

// 开始时：
// 12340  0   0
// -------------
// 2340  10   0
// 340  10   20
// 340  0   120
// 40  30   120
// 140  30   20
// 140  230   0
// 40  1230   0
// 0  1230   40
// 0  230   140
// 20  30   140
// 120  30   40
// 120  0   340
// 20  10   340
// 0  10   2340
// 0  0   12340

