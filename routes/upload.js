var express = require('express');
//var UUID  = require('./../app');
var AdmZip = require('adm-zip');
var fs = require('fs')
var fsext = require('fs-extra');
var multer  = require('multer');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');


const uuid = uuidv4();  
//一時フォルダ作成
//const dir = fs.mkdtempSync('tmp/foo')
const dir = fs.mkdtempSync('tmp/'+`${uuid}`)
  console.log(dir);
  console.log("UUIDは;",uuid);

var storage = multer.diskStorage({
  // アップロードファイルの保存先を指定
  destination: function (req, file, cb) {
    cb(null, `${dir}`+"/")
  },
  // アップロードファイルの保存名を指定(オリジナルのファイル名を指定)
  filename: (req,file,cb) => {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

router.post('/', upload.single('file'), function(req, res, next) {
  console.log(req.file);
  console.log(req.body);
  res.send('upload success');
  console.log("ファイル名は："+req.file.originalname);
  //console.log("UUIDは;",UUID.UUID);


  //解凍
  // 解凍するzipファイルを取得
  var zip = new AdmZip(`${dir}`+"/"+`${req.file.originalname}`);
  var zipEntries = zip.getEntries(); // an array of ZipEntry records

  //ログ出力
  zipEntries.forEach(function(zipEntry) {
    console.log(zipEntry.toString()); // outputs zip entries information
    if (zipEntry.entryName == "my_file.txt") {
          console.log(zipEntry.getData().toString('utf8')); 
    }
  });
    // outputs the content of some_folder/my_file.txt
    //console.log(zip.readAsText("some_folder/my_file.txt"));
    // extracts everything
  zip.extractAllTo(/*target path*/`${dir}`+"/", /*overwrite*/true);
});


//ディレクトリの削除
// fsext.remove(`${dir}`+"/", (err) => {
//   if (err) throw err;

//   console.log('tmpディレクトリを削除しました');
// });


module.exports = router;