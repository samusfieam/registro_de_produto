var express = require('express'),
app = express(),
port = process.env.PORT || 3000,
bodyParser =require('body-parser');

//things needed
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var fs = require('fs');

//Connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/produtodb');
//app.use(express.static('public'));

app.use('/public', express.static(__dirname + '/public'));



//Model Produto
var Produto = mongoose.model('Produto',{

    titulo:{ type:String},
    preco:{type:Number},
    descricao:{type:String},
    imagem:{type:String},
    dataCompra:{type:Date,default: Date.now},
    categoria:{
      type:[{ type: String, enum:['outros','eletronicos','musica','livros']}],
      default:['']
    }

}


);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/', function(req, res){
  console.log('works'+port);
  res.sendFile(__dirname + '/index.html');
 
});
// GET Methot route 
app.get('/produtos',function(req, res){

  Produto.find({}, function(err, produto) {
    if (err)
      res.send(err);
    res.json(produto);
  });

});

// GET by ID method route
app.get('/produto/:id',function(req,res){

  Produto.findById(req.params.id, function(err, produto) {

    if (err){
      res.send(err);
    } 
    res.json(produto);

  });

});

// POST method route
app.post('/produtos', upload.any(), function (req, res) {
  
    console.log("-----novo----");
    console.log(req.files);

    if(req.files){
      req.files.forEach(function(file){

        var filename = (new Date).valueOf()+"-"+file.originalname;
        fs.rename(file.path,'public/images/'+filename, function(err){

          if(err) throw err;
          
          var produto = new Produto({

            titulo : req.body.titulo,
            preco: req.body.preco,
            descricao: req.body.descricao,
            imagem: filename,
            categoria : req.body.categoria
               

          });

          produto.save(function(err,result){

            if(err){

              res.json({failed:err});

            }else{

              res.json(result);

            }

          });


        });

      });
    }

});

// PUT method Route
app.put('/produto/:id',upload.any(),function(req,res){

  console.log("-----------EDITAR-------------");
  //console.log(req.files);
  if(req.files){
    req.files.forEach(function(file){
      var filename = (new Date).valueOf()+"-"+file.originalname;

      fs.rename(file.path,'public/images/'+filename, function(err){

        Produto.findById({_id:req.params.id}, function(err,doc){
          if(err) res.json(err);
          doc.imagem = filename;
          doc.save();
        });

      });


     
   });
  }
  Produto.findOneAndUpdate({_id:req.params.id},req.body,function(err,produto){

    fs.unlink(__dirname+'/public/images/'+produto.imagem, function() {
      res.send ({
        status: "200",
        responseType: "string",
        response: "success"
      });     
    });

    
  });

  

   
});


// DELETE method route
app.delete('/excluir/:id',function(req,res){

  Produto.remove({_id: req.params.id}, function(err, produto) {
    if(err) { 
       return res.send({status: "200", response: "fail"});
    }
    fs.unlink(__dirname+'/public/images/'+produto.imagem, function() {
      res.send ({
        status: "200",
        responseType: "string",
        response: "success"
      });     
    });
  
}
);  

});


app.use(function(req,res,next){
    
        res.header("Accept-Control-Allow-Origin","*");
        res.header("Accept-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept,Authorization,sid");
        res.header("Accept-Control-Allow-Methods","GET,POST,PUT,DELETE");
        next();
     
    
});




app.listen(port);