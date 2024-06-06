const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const express = require('express');
const app = express();

const admin = require("./firebase");
const db = admin.database();

app.get('/', (req, res) => {
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

app.get('/novo/', async (req,res) =>{
    const docCompra = db.ref("compras").push();
    const compra = {
        data: req.query.data,
        responsavel: req.query.responsavel,
        status: "aberto",
        valor: ""
    };
    docCompra.set(compra);
    res.json({id : docCompra.key });
});

app.get('/livros', async(req, res) => {
    const docLivros = db.ref("livros");
    await docLivros.once("value", function(snapshot){
        const livros = snapshot.val();
        return res.json(livros);
    })
});

app.get("/livro/:id", async (req, res) => {
    let livro = req.params.id;
    const docLivro = db.ref("livros/"+livro);
    await docLivro.once("value", function(snapshot){
        livro = snapshot.val();
        res.json(livro);
    });
});

app.get("/adicionarlivro/:compraId/:livroId/:livroNome/:livroValor/:livroQuantidade", async (req, res) => {
    let compraId = req.params.compraId;
    let livroId = req.params.livroId;
    let livroNome = req.params.livroNome;
    let livroValor = req.params.livroValor;
    let livroQuantidade = req.params.livroQuantidade;
    const docCompra = db.ref("compras/"+compraId+"/livros/"+livroId).push();
    const livro = {
        nome: livroNome,
        valor: livroValor,
        quantidade: livroQuantidade
    }
    docCompra.set(livro)
        .then(() => res.json({ sucesso: true }))
        .catch((error) => res.json({ sucesso: false }));
});

module.exports = app;