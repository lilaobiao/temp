
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



