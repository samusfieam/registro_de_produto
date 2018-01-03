var express = require('express'),
app = express(),
port = process.env.PORT || 3000;

//things needed
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var fs = require('fs');

//Connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/produtodb');


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

app.use('/public', express.static(__dirname + '/public'));
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

// POST method route
app.post('/produtos', upload.any(), function (req, res) {
  
    if(req.files){

      console.log(req);

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

// GET by ID method route
app.get('/produto/:id',function(req,res){

  Produto.findById(req.params.id, function(err, produto) {
    if (err)
      res.send(err);
    res.json(produto);
            console.log(produto);
  });

});
// PUT method Route
app.put('/produto/:id',function(req,res){

    return Produto.findById(req.params.id, function(err,produto){

        console.log('produto----');
        console.log(req);

        produto.titulo = req.body.titulo;
        produto.descricao = req.body.descricao;
        produto.preco = req.body.preco;
        produto.categoria = req.body.categoria;

    

    });


});


// DELETE method route
app.delete('/excluir/:id',function(req,res){
 
  console.log('excluir: '+ req.params.id);
 
  Produto.remove({
    _id: req.params.id
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Produto não pôde ser excluido.' });
  }); 

});


app.use(function(req,res,next){
    
        res.header("Accept-Control-Allow-Origin","*");
        res.header("Accept-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept,Authorization,sid");
        res.header("Accept-Control-Allow-Methods","GET,POST,PUT,DELETE");
        next();
     
    
});




app.listen(port);