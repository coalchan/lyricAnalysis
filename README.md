lyricAnalysis
=============
## 介绍
### lyricCrawler.js
用来从百度音乐爬取歌词

### stat.js
用来对歌词进行韵脚的统计

### analyze
用来对歌词进一步的分析

## 开始
1. 将pinyin.js覆盖node_modules中的pinyin模块
`cp ./pinyin.js ./node_modules/pinyin/src/`

2. 从百度音乐下载歌词
`node lyricCrawler.js`

3. 统计
`node stat.js`

4. 分析
`node analyze.js`
