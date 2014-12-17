var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var urlhelp = require('url');
var fs = require('fs');
var request = require('request');

var mainUrl = 'http://music.baidu.com/';

//var urls = [];
var baiduMusicUrl = 'http://music.baidu.com/album/73078';//恋恋风尘
var baiduMusicUrl1 = 'http://music.baidu.com/album/123890520';//在路上
var baiduMusicUrl2 = 'http://music.baidu.com/album/7288115';//北京的冬天
var baiduMusicUrl3 = 'http://music.baidu.com/album/111926';//单曲 - 鸟儿的幻想
var baiduMusicUrl4 = 'http://music.baidu.com/album/7288127';//晴朗
var baiduMusicUrl5 = 'http://music.baidu.com/album/111924';//校园名曲精选
var baiduMusicUrl6 = 'http://music.baidu.com/album/165293';//单曲-睡在我上铺的兄弟

//var baiduMusicUrl = 'http://music.baidu.com/album/7288187';//生如夏花

//urls.push(baiduMusicUrl);
//urls.push(baiduMusicUrl1);
//urls.push(baiduMusicUrl2);
//urls.push(baiduMusicUrl3);
//urls.push(baiduMusicUrl4);
//urls.push(baiduMusicUrl5);
//urls.push(baiduMusicUrl6);

var urls = fs.readFileSync('./musicUrlList.txt', 'utf8').split(/\r?\n/ig);

console.log(urls);

if (!fs.existsSync('./lyric')) {
  fs.mkdirSync('./lyric');
}

for(var i in urls){
  var baiduMusicUrl = urls[i];
	if(baiduMusicUrl.trim() === '') continue;
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
					 var $ = cheerio.load(res.text);
					 
					 var file_url = urlhelp.resolve(mainUrl,JSON.parse($('.down-lrc-btn').first().attr('data-lyricdata')).href);
					 var file_name = file_url.split('/').pop().split('.')[0] + '_' + $('.name').first().text().trim() + '.lrc';
					 
					 if(file_url != mainUrl) {//防止下载LRC歌词的链接为空
							request.head(file_url, function(err, res, body){
								request(file_url).pipe(fs.createWriteStream("./lyric/" + file_name));
								console.log(file_name+' has been downloaded...');
							}); 
					 }
				});
		 });
		    
	});
}

console.log('-----------------------------');
