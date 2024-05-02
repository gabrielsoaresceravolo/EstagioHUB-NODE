const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const express = require('express');
const app = express();
const port = 3000;

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log('Servidor iniciado!');
});

// Rota da página de formulário de login
app.get('/', (req, res) => {
    fs.readFile('src/login.html', (e, dados) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(dados);
        res.end();
    });
});

// Rota da página principal
app.post('/acessar', urlencodedParser, (req, res) => {
    res.redirect("/home");
});

// Rota da página de logout
app.get('/sair', (req, res) => {
    fs.readFile('src/login.html', (e, dados) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(dados);
        res.end();
    });
});

// Rota da página inicial
app.get('/home', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/index.html', (e, dados) => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(cabecalho + dados + rodape);
                res.end();
            });
        });
    });
});

const livrosRouter = require("./livrosRouter");
app.use("/livros", livrosRouter);