var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var urlhelp = require('url');
var fs = require('fs');
var request = require('request');

var mainUrl = 'http://music.baidu.com/';

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
