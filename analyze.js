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

var specialLyrics = [];

//获取一个文件中每行的最后一个字的韵母的次数排名第一和第二作为韵脚
function getFootFromLyric(filepath,finals_word_map) {
  var foots = [];
  
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
          chars += lastChar;
          break;
        }
      }
    }
  }
  var footRes = pinyin(chars, {style: pinyin.STYLE_FINALS});
  for(var i in footRes) {
    var foot = footRes[i][0];
    foots.push(foot);
    if(!finals_word_map.hasOwnProperty(foot)) {
      finals_word_map[foot] = [];
    } 
    finals_word_map[foot].push(chars[i]);
  }

  var wc = {};
  wordCount(foots,wc);
  var sortedFoot = sort(wc);
  
  if(sortedFoot.length>=1 && sortedFoot.length<=2) {
    specialLyrics.push(filepath.split('/').pop());
  }
  
  var Top2Foots = {};
  for(var i in sortedFoot) {
    if(i==2) break;
    Top2Foots[sortedFoot[i][0]] = sortedFoot[i][1];
  }
  return Top2Foots;
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

//韵脚统计
function footsCount(foots,foots_wc) {
  var keys = Object.keys(foots);
  
  for(var i in keys){
    var foot = keys[i];
    if(!foots_wc.hasOwnProperty(foot)) {
      foots_wc[foot] = foots[keys[i]];
    }else {
      foots_wc[foot] += foots[keys[i]];
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

//开始统计
var finals_word_map = {};

/*var finals = getFootFromLyric('./lyric/1168167_每一分一秒.lrc', finals_word_map);
console.log(finals);
console.log(finals_word_map); */ 


var finals_wc = {};
var foots_wc = {};

var fileList = getFileList('./lyric');
for(var i in fileList) {
  var foots = getFootFromLyric(fileList[i],finals_word_map);
  footsCount(foots,foots_wc);
  // wordCount(finals,finals_wc);
}
// console.log(foots_wc);

var sortedFoots_wc = sort(foots_wc);
// console.log(sortedFoots_wc);

// console.log(specialLyrics);

//对于map中的汉字进行统计并排序
var keys = Object.keys(finals_word_map);
for(var i in keys) {
  var temp_wc = {};
  wordCount(finals_word_map[keys[i]],temp_wc);
  
  finals_word_map[keys[i]] = sort(temp_wc);
  temp_wc = {};
}
// console.log(finals_word_map);

var analysisRes = '下面是韵脚排名及对应的汉字排名：\n';
for(var i in sortedFoots_wc) {
  var foot = sortedFoots_wc[i][0];
  var count = sortedFoots_wc[i][1];
  var foot_map_words = finals_word_map[foot];
  analysisRes += foot + ' : ' + count + ' -> ' + foot_map_words + '\n';
}
analysisRes += '\n下面是比较特殊的歌词，它们的每一行的最后一个字的韵母只有不多于2个，可以说几乎通篇押韵！\n' + specialLyrics + '\n';
// console.log(analysisRes);

//将结果写入文件
fs.writeFileSync('./analyzeRes.txt',analysisRes,'utf8');  
