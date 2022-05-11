var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

// app.set('views','./views');
app.set('view engine','ejs'); // ejs 템플릿 엔진 연동

// routing setting - 라우팅
app.get('/', function(req,res){
    // res.send('HelloWorld!');
    var data = req.body;
    res.render('index',{name:data}); // views dir 안에 있는 index.ejs 파일
});

app.post('/', function(req,res){
    var data = req.body.name;
    res.render('index',{name : data});
});

app.listen(8080,function(){
    console.log('App Listening on port 8080')
})