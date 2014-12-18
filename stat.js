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
    
    //找出每行从行尾开始第一个汉字
    if(flag == 1) {
      for(var i=line.length-1;i>=0;i--) {
        var lastChar = line.charAt(i);
        if(lastChar.isCN()) {
          words.push(lastChar);
          chars += lastChar;
          break;
        }
      }
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

// var lyric = getLastWordInFileLine('./lyric/1168167_每一分一秒.lrc');
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
fs.writeFileSync('./statRes.txt',JSON.stringify(sort(words_wc)),'utf8'); 
fs.appendFileSync('./statRes.txt','\n\n' + JSON.stringify(sort(finals_wc)),'utf8');
