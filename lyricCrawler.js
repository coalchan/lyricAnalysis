var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var urlhelp = require('url');
var fs = require('fs');
var request = require('request');

var mainUrl = 'http://music.baidu.com/';

var baiduMusicUrl = 'http://music.baidu.com/album/73078';//恋恋风尘
//var baiduMusicUrl = 'http://music.baidu.com/album/123890520';//在路上
//var baiduMusicUrl = 'http://music.baidu.com/album/7288115';//北京的冬天
//var baiduMusicUrl = 'http://music.baidu.com/album/111926';//单曲 - 鸟儿的幻想
//var baiduMusicUrl = 'http://music.baidu.com/album/7288127';//晴朗
//var baiduMusicUrl = 'http://music.baidu.com/album/111924';//校园名曲精选
//var baiduMusicUrl = 'http://music.baidu.com/album/165293';//单曲-睡在我上铺的兄弟

//var baiduMusicUrl = 'http://music.baidu.com/album/7288187';//生如夏花

var ep = new eventproxy();

if (!fs.existsSync('./lyric')) {
  fs.mkdirSync('./lyric');
}

superagent.get(baiduMusicUrl).end(function(err, res){
   if(err) {
      console.log(err);
   }
   var musicUrls = [];
   
   var $ = cheerio.load(res.text);

   var $songs = $('.body').eq(1);
   $songs.find('.song-title').each(function(idx, element1){
      var $element = $(element1);
      var $song = $element.children('a').first();
      var singleSongUrl = urlhelp.resolve(mainUrl,$song.attr('href'));
      musicUrls.push(singleSongUrl);
   });

   console.log(musicUrls); 
   console.log('\n页面所有音乐链接爬取完毕!\n')
   
   musicUrls.forEach(function(url){
      superagent.get(url).end(function(err, res){
         ep.emit('song_detail',res.text);
      });
   });
   
   ep.after('song_detail', musicUrls.length, function(detail_html){
      var result = detail_html.map(function(topic){
         var $ = cheerio.load(topic);
         
         var file_url = urlhelp.resolve(mainUrl,JSON.parse($('.down-lrc-btn').first().attr('data-lyricdata')).href);
         var file_name = $('.name').first().text().trim();
         
         if(file_url != mainUrl) {//防止下载LRC歌词的链接为空
            request.head(file_url, function(err, res, body){
              request(file_url).pipe(fs.createWriteStream("./lyric/" + file_name));
            }); 
         }
         
         return({
            title: file_name,
            lyric: file_url
         });
      });
      
       console.log(result); 
   });   
});

console.log('-----------------------------');
