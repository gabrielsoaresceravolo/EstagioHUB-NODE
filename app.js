const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const express = require('express');
const session = require('express-session');
const app = express();
const port = 8080;

app.use(express.static('public'));

// =====================================================================================

app.use(session({
    'secret' : 'gdaskjdasjdha8219391273dsadsa',
    'resave' : false,
    'saveUninitialized' : true,
    'cookie': {secure: false}
}));

// =====================================================================================

var admin = require("./firebase");
const db = admin.database();

// =====================================================================================

async function verificaToken(token)
{
    let status;
    await admin.auth().verifyIdToken(token)
        .then((decodedToken) => 
        {
            status = true;
        })
        .catch((error) => 
        {
            status = false;
        });
    return status;
}

// =====================================================================================


// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log('\nIniciando Servidor...\n'+'\nServidor iniciado com sucesso!\n'+'porta de acesso: 8080\n');
});

// =====================================================================================

// Rota - FAZER LOGIN
app.get('/', (req, res) => {
    fs.readFile('src/login.html', (e, dados) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(dados);
        res.end();
    });
});

// Rota - HOME
app.get('/acessar', (req, res) => {
    let token = req.query.token;
    if (verificaToken(token)){
        req.session.authToken = token;
        res.redirect("/home");
    } else {
        res.redirect("/acesso-negado");
    }
});

//Rota para cadastrar novo usuário
app.get('/cadastrar', (req, res) => {
    fs.readFile('src/cadastrar.html', (e, dados) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(dados);
        res.end();
    });
});

// =====================================================================================

// Rota - LOGOUT
app.get('/sair', (req, res) => {
    delete req.session.authToken;
    res.redirect('/');
});

// =====================================================================================

// Rota da página inicial
app.get('/home', (req, res) => {
    if (req.session.authToken){
        fs.readFile('src/cabecalho.html', (e, cabecalho) => {
            fs.readFile('src/rodape.html', (e, rodape) => {
                fs.readFile('src/index.html', (e, dados) => {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(cabecalho + dados + rodape);
                    res.end();
                });
            });
        });
    } else {
        res.redirect('/acesso-negado');
    }
});

const livrosRouter = require("./livrosRouter");
app.use("/livros", livrosRouter);

const comprasRouter = require("./comprasRouter");
app.use("/compras", comprasRouter);
