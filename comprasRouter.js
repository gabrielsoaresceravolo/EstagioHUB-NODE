const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const express = require('express');
const app = express();

var admin = require("./firebase.js");
const db = admin.database();

app.get('/', (req, res) =>{
    fs.readFile('src/cabecalho.html', (e, cabecalho) =>{
        fs.readFile('src/rodape.html', (e, rodape) =>{
            fs.readFile('src/compras/compras.html', (e, dados) =>{
                res.writeHead(200, {"Content-Type": 'text/html'});
                res.write(cabecalho+dados+rodape);
                res.end();
            });
        });
    });
});

app.get('/novo/', async (req, res) =>{
    const docCompra = db.ref("compras").push();
    const compra = {
        data: req.query.data,
        responsavel: req.query.responsavel,
        status: "Aberto",
        valor: ""
    }
    docCompra.set(compra);
    res.json({ id: docCompra.key });
});

app.get('/livros', async (req, res) =>{
    const docLivros = db.ref("livros");
    docLivros.once("value", function(snapshot){
        const livros = snapshot.val();
        return res.json(livros);
    });
});

module.exports = app;