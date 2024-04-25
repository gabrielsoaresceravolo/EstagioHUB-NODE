const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const express = require('express');
const app = express();
const port = 8080;

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log('O servidor foi iniciado na porta 8080');
});

const admin = require("./firebase");
const firebase = admin.auth();

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

    const email = req.body.email;
    const senha = req.body.senha;

    firebase.auth().signInWithEmailAndPassword(email, senha)
    .then((userCredentials) => {
        res.redirect("/home");
    })
    .catch((error) => {
        console.log(error);
        res.redirect("/")
    });
});

// Rota da página de logout
app.get('/sair', (req, res) => {
    firebase.signOut()
    .then(() => {
        res.redirect('/');
    })
    .catch((error) => {
        console.log(error);
        res.redirect('/');
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

app.get('/acesso-negado', (req, res) => {
    fs.readFile('src/acesso-negado.html', (e, dados) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(dados);
        res.end();
    });
});

const livrosRouter = require("./livrosRouter");
app.use("/livros", livrosRouter);