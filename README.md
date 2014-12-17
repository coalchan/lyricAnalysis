lyricAnalysis
=============
##介绍
###lyricCrawler.js
用来从百度音乐爬取歌词

###app.js
用来对歌词进行韵脚的统计分析

##开始
1. 将pinyin.js覆盖node_modules中的pinyin模块
`cp ./pinyin.js ./node_modules/pinyin/src/`

2. 从百度音乐下载歌词
`node lyricCrawler.js`

3. 统计
`node app.js`
