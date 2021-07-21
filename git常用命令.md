https://hiberabyss.github.io/2017/03/21/git-amend-commits/  

[Git：在 merge 的时候忽略特定的文件](https://hiberabyss.github.io/2018/03/03/git-ignore-specific-file/)

## 技巧

1. git commit 会启动你选择的文本编辑器来输入提交说明。使用 git config --global core.editor 命令设置你喜欢的编辑器。
    git commit -a 跳过 add 直接 commit
2. git rm 从缓存区（添加过跟踪的状态）移除跟踪文件，如果文件修改过没缓存，使用git rm -f,
如果只是想删除跟踪，而不想从磁盘删除，使用 git rm --cached filename
3. git mv file_from file_to  重命名文件，等同于执行了下面三条命令
$ mv README.md README
$ git rm README.md
$ git add README

4. git log -p 或 git log --patch 打印日志，该选项除了显示基本信息之外，还附带了每次提交的变化。
   git log --pretty=oneline 每次提交只显示一行

   git log --pretty=format:"%h - %an, %ar : %s"

git log --pretty=format 常用的选项 列出了 format 接受的常用格式占位符的写法及其代表的意义。

Table 1. git log --pretty=format 常用的选项
选项	说明
%H      提交的完整哈希值
%h      提交的简写哈希值
%T      树的完整哈希值
%t 树的简写哈希值
%P 父提交的完整哈希值
%p 父提交的简写哈希值
%an 作者名字
%ae 作者的电子邮件地址
%ad 作者修订日期（可以用 --date=选项 来定制格式）
%ar 作者修订日期，按多久以前的方式显示
%cn 提交者的名字
%ce 提交者的电子邮件地址
%cd 提交日期
%cr 提交日期（距今多长时间）
%s 提交说明

5. git log --pretty=format:"%h %s" --graph 打印日志且展示分支图
6. 可以通过git config为git命令设置别名，方便使用，例如：
$ git config --global alias.co checkout  //git co = git checkout
$ git config --global alias.br branch
$ git config --global alias.ci commit
$ git config --global alias.st status


[更多git log 的使用参考](https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-%E6%9F%A5%E7%9C%8B%E6%8F%90%E4%BA%A4%E5%8E%86%E5%8F%B2)

## .gitignore

文件 .gitignore 的格式规范如下：

所有空行或者以 # 开头的行都会被 Git 忽略。

可以使用标准的 glob 模式匹配，它会递归地应用在整个工作区中。

匹配模式可以以（/）开头防止递归。

匹配模式可以以（/）结尾指定目录。

要忽略指定模式以外的文件或目录，可以在模式前加上叹号（!）取反。

所谓的 glob 模式是指 shell 所使用的简化了的正则表达式。 星号（*）匹配零个或多个任意字符；[abc] 匹配任何一个列在方括号中的字符 （这个例子要么匹配一个 a，要么匹配一个 b，要么匹配一个 c）； 问号（?）只匹配一个任意字符；如果在方括号中使用短划线分隔两个字符， 表示所有在这两个字符范围内的都可以匹配（比如 [0-9] 表示匹配所有 0 到 9 的数字）。 使用两个星号（**）表示匹配任意中间目录，比如 a/**/z 可以匹配 a/z 、 a/b/z 或 a/b/c/z 等。

我们再看一个 .gitignore 文件的例子：

忽略所有的 .a 文件
*.a

但跟踪所有的 lib.a，即便你在前面忽略了 .a 文件
!lib.a

只忽略当前目录下的 TODO 文件，而不忽略 subdir/TODO
/TODO

忽略任何目录下名为 build 的文件夹
build/

忽略 doc/notes.txt，但不忽略 doc/server/arch.txt
doc/*.txt

忽略 doc/ 目录及其所有子目录下的 .pdf 文件
doc/**/*.pdf


### 修正commit

有时候我们提交完了才发现漏掉了几个文件没有添加，或者提交信息写错了。 此时，可以运行带有 --amend 选项的提交命令来重新提交：

$ git commit --amend
这个命令会将暂存区中的文件提交。 如果自上次提交以来你还未做任何修改（例如，在上次提交后马上执行了此命令）， 那么快照会保持不变，而你所修改的只是提交信息。

文本编辑器启动后，可以看到之前的提交信息。 编辑后保存会覆盖原来的提交信息。

例如，你提交后发现忘记了暂存某些需要的修改，可以像下面这样操作：

$ git commit -m 'initial commit'
$ git add forgotten_file
$ git commit --amend
最终你只会有一个提交——第二次提交将代替第一次提交的结果。

Note
当你在修补最后的提交时，并不是通过用改进后的提交 原位替换 掉旧有提交的方式来修复的， 理解这一点非常重要。从效果上来说，就像是旧有的提交从未存在过一样，它并不会出现在仓库的历史中。

修补提交最明显的价值是可以稍微改进你最后的提交，而不会让“啊，忘了添加一个文件”或者 “小修补，修正笔误”这种提交信息弄乱你的仓库历史。

### 取消暂存的文件

如果，你已经修改了两个文件并且想要将它们作为两次独立的修改提交， 但是却意外地输入 git add * 暂存了它们两个。如何只取消暂存两个中的一个呢？ 我们可以使用 git reset HEAD <file> 来取消暂存 CONTRIBUTING.md 文件。

```s
$ git reset HEAD CONTRIBUTING.md
Unstaged changes after reset:
M	CONTRIBUTING.md
```

### 撤消对文件的修改

如果你并不想保留对 CONTRIBUTING.md 文件的修改怎么办？ 你该如何方便地撤消修改——将它还原成上次提交时的样子（或者刚克隆完的样子，或者刚把它放入工作目录时的样子）？ 我们可以使用 git checkout -- <file> 来撤消对文件的修改。

```s
$ git checkout -- CONTRIBUTING.md
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

    renamed:    README.md -> README
```

> 请务必记得 git checkout -- <file> 是一个危险的命令。 你对那个文件在本地的任何修改都会消失——Git 会用最近提交的版本覆盖掉它。 除非你确实清楚不想要对那个文件的本地修改了，否则请不要使用这个命令。


### 标签

git tag 以字母顺序列出标签
git tag -l "v1.8.5*" 按照特定的模式查找标签，支持正则和精确匹配
git show v1.4 显示某个标签的信息

git tag v1.4-l 添加轻量标签
git tag -a v1.4 -m "my version 1.4"  添加附注标签（比轻量标签有用，建议使用）
git tag -a v1.2 <commit号>   给之前的commit添加标签
git tag -d v1.4-lw  删除标签

默认情况下，git push 命令并不会传送标签到远程仓库服务器上。 在创建完标签后你必须显式地推送标签到共享服务器上。 这个过程就像共享远程分支一样——你可以运行 git push origin <tagname>。

git push origin <tagname> 推送远程标签
git push origin --delete <tagname> 删除远程标签
git checkout <tagname>  检出标签


### 分支

分支合并
$ git checkout master
$ git merge hotfix


当你试图合并两个分支时， 如果顺着一个分支走下去能够到达另一个分支，那么 Git 在合并两者的时候， 只会简单的将指针向前推进（指针右移），因为这种情况下的合并操作没有需要解决的分歧——这就叫做 “快进（fast-forward）”。

git branch -v 查看每一个分支的最后一次提交
git branch --merged  查看哪些分支已经合并到当前分支
git branch --no-merged  查看哪些分支还有内容没合并到当前分支

git push origin serverfix 推送分支到远程
git checkout -b serverfix origin/serverfix 拉取远程分支
git checkout -b sf origin/serverfix 拉取远程分支并重命名
git push origin --delete serverfix  删除远程分支


如果想要查看设置的所有跟踪分支，可以使用 git branch 的 -vv 选项。 这会将所有的本地分支列出来并且包含更多的信息，如每一个分支正在跟踪哪个远程分支与本地分支是否是领先、落后或是都有。

$ git branch -vv
  iss53     7e424c3 [origin/iss53: ahead 2] forgot the brackets
  master    1ae2a45 [origin/master] deploying index fix
* serverfix f8674d9 [teamone/server-fix-good: ahead 3, behind 1] this should do it
  testing   5ea463a trying something new
这里可以看到 iss53 分支正在跟踪 origin/iss53 并且 “ahead” 是 2，意味着本地有两个提交还没有推送到服务器上。 也能看到 master 分支正在跟踪 origin/master 分支并且是最新的。 接下来可以看到 serverfix 分支正在跟踪 teamone 服务器上的 server-fix-good 分支并且领先 3 落后 1， 意味着服务器上有一次提交还没有合并入同时本地有三次提交还没有推送。 最后看到 testing 分支并没有跟踪任何远程分支。

git pull 在大多数情况下它的含义是一个 git fetch 紧接着一个 git merge 命令。
    
    
## 实用操作
    
同步代码
Git stash
Git pull
Git stash pop
Git checkout -b xxxx

开始开发


提交代码
Git add .
Git commit -m ‘xxx’
// 修改最近一次提交信息
git commit —amend -m “xxx”

// 将分支推送到远程
git push origin xxx 
// 删除远程分支
git push —delete origin xxx
git push origin —delete xxx

// 查看全部分支(包含本地和远程) 
git branch -a
// 查看本地分支
git branch
// 清理本地无效分支(远程已删除本地没删除的分支): 
git fetch -p
// 拉取远程分支
git fetch origin dev
// 拉取远程分支并在本地建立对应分支，切换到该分支
git checkout -b dev(本地分支名称) origin/dev(远程分支名称)
git checkout -b feature/v20210609-sg-api-debug origin/feature/v20210609-sg-api-debug

// 把某个分支上的内容都拉取到本地
git pull origin dev(远程分支名称)


到提交的远程分支下创建合并请求 create request merge


// 合并远程分支
git fetch origin xxxx
git merge origin xxxx

git merge xxx 合并本地分支
git merge --abort 取消合并
git merge --abort 选项会尝试恢复到你运行合并前的状态。 但当运行命令前，在工作目录中有未储藏、未提交的修改时它不能完美处理，除此之外它都工作地很好。


git merge -Xignore-all-space xxx  完全忽略空白修改
git merge -Xignore-space-change xxx  将一个空白符与多个连续的空白字符视作等价的



如何把本地的修改移动到另一个分支，比如，你不小心在master分支上开发了部分代码，但你提交时不想提交到master，需要新建一个分支提交
如果从未提交
先暂存修改
git stash
然后切换到新分支
git checkout -b newbranchname
然后在新分支直接应用更改
git stash pop


如果更改已提交：
然后创建一个分支：
git checkout -b newbranch
结帐回master分支：
git checkout master
重置为先前的提交：
git reset --hard head^1


git restore指令使得在工作空间但是不在暂存区的文件撤销更改，还没有add 的修改，Changes not staged for commit:
git restore . 可以撤销所有修改的文件，但是不会删除新加的文件

git restore --staged的作用是将暂存区的文件从暂存区撤出，但不会更改文件的内容。 用于撤销已经add，但是还没有commit的修改
https://blog.csdn.net/qq_38158479/article/details/106972138

C3-9  2:15 - 3:00
债券-每日营运事项-每日钱货对账

git 合并多次commit

git rebase -i HEAD~5
选取最近的5笔 commit

如何合并失败，可以撤销合并
git rebase —abort

git push -f 把合并推送到远程
https://www.cnblogs.com/zhaoyingjie/p/10259715.html

git log
git rebase -i HEAD~4 // 除了第一次，其他的都选fixup
git commit --amend

hotfix/v20210713-fix-srpc-timeout
hotfix/v20210714-set-srpc-timeout


-i 是交互式的意思，胡扯
-i, --interactive let the user edit the list of commits to rebase


pick：正常选中
reword：选中，并且修改提交信息；
edit：选中，rebase时会暂停，允许你修改这个commit（参考这里）
squash：选中，会将当前commit与上一个commit合并
fixup：与squash相同，但不会保存当前commit的提交信息
exec：执行其他shell命令



体验OK之后合代码，

测试环境给测试体验



场景3
在分支1开发了部分代码，并且已经commit了，但我想在分支2提交（分支2也有了一部分代码），并且在这之前还要合并master分支的代码

先add commit把分支1处理干净
git checkout master
Git pull
Git checkout branch2
git merge master //这个时候可能有冲突，把冲突解决掉，先git add，再git commit

Git merge branch1 // 有冲突

Auto-merging static/src/pages/risk-oss/pages/fundHomepageConfig/submodule/theme/ThemeDetail.vue
Auto-merging static/src/pages/risk-oss/pages/fundHomepageConfig/submodule/selected/SelectedDetail.vue
Auto-merging server/src/config/SG/development.js
CONFLICT (content): Merge conflict in server/src/config/SG/development.js
Auto-merging server/src/config/CN/development.js
Automatic merge failed; fix conflicts and then commit the result.

解决掉冲突，先git add .再git commit -m “”
Git merge branch1 // 解决完冲突再merge
Already up to date.
