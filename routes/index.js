var express = require('express');
var router = express.Router();
var path = require("path");
var fs = require("fs");
var media = path.join(__dirname,"../public/media");

/* GET home page. */
router.get('/', function(req, res, next) {
	fs.readdir(media,function(err,nameList){
		if(err){
			console.log(err);
		}else{
  			res.render('index', { title: 'musicView',nameList:nameList });
		}
	})
});

module.exports = router;
