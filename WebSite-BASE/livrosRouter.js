const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const express = require('express');
const app = express();

// =============================================================================

var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://app-node-js-fatec-01-default-rtdb.firebaseio.com" // ADICIONAR O BANCO DE DADOS AQUI
});

function criarTabela(dados) 
{
    let tabela = `<table class="table table-striped zebrado">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome do Livro</th>
                            <th>Editora</th>
                            <th>Gênero</th>
                            <th>Valor</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>`;
    for (let chave in dados) 
    {
        tabela += `<tr>
                        <td>${chave}</td>
                        <td>${dados[chave].nome}</td>
                        <td>${dados[chave].editora}</td>
                        <td>${dados[chave].genero}</td>
                        <td>${dados[chave].valor}</td>
                        <td>
                            <a class="btn btn-outline-warning" href="/livros/editar/${chave}">
                                Alterar
                            </a>
                        </td>
                        <td>
                            <a class="btn btn-outline-danger" href="/livros/excluir/${chave}">
                                Excluir
                            </a>
                        </td>
                    </tr>`;
    }            
    tabela += `</tbody >
            </table > `;
    return tabela;
}
const db = admin.database();

// =============================================================================

// Rota da página que exibe os livros registrados no banco de dados
app.get('/', (req, res) => 
{
    fs.readFile('src/cabecalho.html', (e, cabecalho) => 
    {
        fs.readFile('src/rodape.html', (e, rodape) => 
        {
            fs.readFile('src/livros/livros.html', (e, dados) => 
            {
                let tabela = "";
                const docLivro = db.ref("livros");
                docLivro.once("value", function(snapshot)
                {
                    tabela = criarTabela(snapshot.val());
                    dados = dados.toString().replace("{tabela}", tabela);
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(cabecalho + dados + rodape);
                    res.end();
                });
            });
        });
    });
});

// Rota da página para abrir formulário para inserir um novo registro de livro
app.get('/novo', (req, res) => 
{
    fs.readFile('src/cabecalho.html', (e, cabecalho) => 
    {
        fs.readFile('src/rodape.html', (e, rodape) => 
        {
            fs.readFile('src/livros/novo_livro.html', (e, dados) => 
            {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(cabecalho + dados + rodape);
                res.end();
            });
        });
    });
});

// Rota da página inserir um novo registro de livro
app.post('/novo', urlencodedParser, (req, res) => 
{
    try
    {
        const docLivro = db.ref("livros").push();
        const livro = 
        {
            nome: req.body.nome,
            editora: req.body.editora,
            genero: req.body.genero,
            valor: req.body.valor
        };
        docLivro.set(livro);
    }
    catch(e)
    {
        console.log(e);
    }

    res.redirect("/livros");
});

// Rota da página para abrir formuário para editar os dados de um registro de livro
app.get('/editar/:id', (req, res) => 
{
    fs.readFile('src/cabecalho.html', (e, cabecalho) => 
    {
        fs.readFile('src/rodape.html', (e, rodape) => 
        {
            fs.readFile('src/livros/editar_livro.html', (e, dados) => 
            {
                let id = req.params.id;
                const docLivro = db.ref("livros/"+id);
                docLivro.once("value", function(snapshot)
                {
                    let nome = snapshot.val().nome;
                    let genero = snapshot.val().genero;
                    let editora = snapshot.val().editora;
                    let valor = snapshot.val().valor;

                    dados = dados.toString().replace("{nome}", nome);
                    dados = dados.toString().replace("{genero}", genero);
                    dados = dados.toString().replace("{editora}", editora);
                    dados = dados.toString().replace("{valor}", valor);
                    dados = dados.toString().replace("{id}", id);

                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(cabecalho + dados + rodape);
                    res.end();
                });
            });
        });
    });
});

// Rota da página para editar os dados de um registro de livro
app.post('/editar', urlencodedParser, (req, res) => 
{
    let id = req.body.id;
    let nome = req.body.nome;
    let genero = req.body.genero;
    let editora = req.body.editora;
    let valor = req.body.valor;                

    const docLivro = db.ref("livros");
    docLivro.child(id).update(
    {
        'nome' : nome,
        'genero' : genero,
        'editora' : editora,
        'valor' : valor,
    });

    res.redirect("/livros");
});

// Rota da página para abrir formulário para excluir um registro de um livro
app.get('/excluir/:id', (req, res) => 
{
    fs.readFile('src/cabecalho.html', (e, cabecalho) => 
    {
        fs.readFile('src/rodape.html', (e, rodape) => 
        {
            fs.readFile('src/livros/excluir_livro.html', (e, dados) => 
            {
                let id = req.params.id;
                const docLivro = db.ref("livros/"+id);
                docLivro.once("value", function(snapshot)
                {
                    let nome = snapshot.val().nome;
                    let genero = snapshot.val().genero;
                    let editora = snapshot.val().editora;
                    let valor = snapshot.val().valor;

                    dados = dados.toString().replace("{nome}", nome);
                    dados = dados.toString().replace("{genero}", genero);
                    dados = dados.toString().replace("{editora}", editora);
                    dados = dados.toString().replace("{valor}", valor);
                    dados = dados.toString().replace("{id}", id);

                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(cabecalho + dados + rodape);
                    res.end();
                });
            });
        });
    });
});

// Rota da página para excluir um registro de um livro
app.post('/excluir', urlencodedParser, (req, res) => 
{      
    let id = req.body.id;
    const docLivro = db.ref("livros/"+id);
    docLivro.remove();
    res.redirect("/livros");
});

module.exports = app;