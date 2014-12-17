var fs = require('fs');
var pinyin = require("pinyin");
var lodash = require('lodash');

String.prototype.startWith=function(str){     
  var reg=new RegExp("^"+str);     
  return reg.test(this);        
} 

String.prototype.endWith=function(str){     
  var reg=new RegExp(str+"$");     
  return reg.test(this);        
} 

String.prototype.isCN=function(){     
  var reg=/[\u4E00-\u9FA5]/g;     
  return reg.test(this);        
}

//深度优先遍历指定目录下的所有文件路径
function getFileList(path){
    var fileList = [];
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item){
        if(fs.statSync(path + '/' + item).isDirectory()){
            getFileList(path + '/' + item);
        }else{
            fileList.push(path + '/' + item);
        }
    });
    return fileList;
}

//获取一个文件中每行的最后一个字和其韵母
function getLastWordInFileLine(filepath) {
  var words = [];
  var finals = [];
  
  var text = fs.readFileSync(filepath, 'utf8').split(/\r?\n/ig);
  var flag = 0;
  var chars = '';
  for(var i in text) {
    var line = text[i];
    if(line.startWith('\\[0') && line.endWith(']')) {
      flag = 1;//从下面一行开始就是歌词正文了
      continue;
    }
    var lastChar = line.charAt(line.length-1);
    if(flag === 1 && lastChar.isCN()) {
      words.push(lastChar);
      chars += lastChar;
    }      
  }
  var finalRes = pinyin(chars, {style: pinyin.STYLE_FINALS});
  for(var i in finalRes) {
    finals.push(finalRes[i][0]);
  }
  // console.log(finals);
  return {words:words,finals:finals};
}

//次数统计
function wordCount(array,wc) {
   for (var i in array) {
      var word = array[i];
      if(!wc.hasOwnProperty(word)) {
         wc[word] = 1;
      }else {
         wc[word]++;
      }
   }
}

//排序
function sort(wc) {
  var keys = Object.keys(wc);
  var characters = [];
  for(var i in keys){
     var key = keys[i];
     var value = wc[key];
     characters.push({
        'word' : key,
        'count' : value
     });
  }
  var res = lodash.map(lodash.sortBy(characters, 'count'), lodash.values).reverse();
  return res;
}

// var lyric = getLastWordInFileLine('D:/programme/git/lyricCrawler/lyric/来不及');
// console.log(lyric);

//开始统计
var words_wc = {};
var finals_wc = {};
var fileList = getFileList('./lyric');
for(var i in fileList) {
  var lyric = getLastWordInFileLine(fileList[i]);
  wordCount(lyric.words,words_wc);
  wordCount(lyric.finals,finals_wc);
}


//var fileList = getFileList('./lyric');

console.log('=======================');
console.log(words_wc);
console.log(finals_wc);

//排序并写入文件
fs.writeFileSync('./res.txt',JSON.stringify(sort(words_wc)),'utf8'); 
fs.appendFileSync('./res.txt','\n\n' + JSON.stringify(sort(finals_wc)),'utf8');




