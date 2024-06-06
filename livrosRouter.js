const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const express = require('express');
const app = express();

const admin = require("./firebase");
const db = admin.database();

function criarTabela(dados) {
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
    for (let chave in dados) {
        tabela += `<tr>
                        <td>${chave}</td>
                        <td>${dados[chave].nome}</td>
                        <td>${dados[chave].editora}</td>
                        <td>${dados[chave].genero}</td>
                        <td>${dados[chave].valor}</td>
                        <td>
                            <a class="btn btn-outline-warning" href="/livros/editar/${chave}">Alterar</a>
                        </td>
                        <td>
                            <a class="btn btn-outline-danger" href="/livros/excluir/${chave}">Excluir</a>
                        </td>
                    </tr>`;
    }            
    tabela += `</tbody >
            </table > `;
    return tabela;
}

// Rota da página que exibe os livros registrados no banco de dados
app.get('/', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/livros/livros.html', (e, dados) => {
                let tabela = "";
                let mensagem = "";
                const docLivros = db.ref("livros");
                docLivros.once("value", function(snapshot){
                    tabela = criarTabela(snapshot.val());
                    dados = dados.toString().replace("{tabela}", tabela);
                    if (req.query.acao){
                        let acao = req.query.acao;
                        if (req.query.status){
                            let status = req.query.status;
                            if (acao == "inserir" && status == "true")
                                mensagem = "Livro inserido com sucesso!";
                            else if (acao == "inserir" && status == "false")
                                mensagem = "Erro ao inserir livro!";
                            else if (acao == "editar" && status == "true")
                                mensagem = "Livro editado com sucesso!";
                            else if (acao == "editar" && status == "false")
                                mensagem = "Erro ao editar o livro!";
                            else if (acao == "excluir" && status == "true")
                                mensagem = "Livro excluído com sucesso!";
                            else if (acao == "excluir" && status == "false")
                                mensagem = "Erro ao excluir livro!";
                        }
                    }
                    dados = dados.toString().replace("{mensagem}", mensagem);
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(cabecalho + dados + rodape);
                    res.end();
                });
            });
        });
    });
});

// Rota da página para abrir formulário para inserir um novo registro de livro
app.get('/novo', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/livros/novo_livro.html', (e, dados) => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(cabecalho + dados + rodape);
                res.end();
            });
        });
    });
});

// Rota da página inserir um novo registro de livro
app.post('/novo', urlencodedParser, (req, res) => {
    try{
        const docLivro = db.ref("livros").push();
        const livro = {
            nome: req.body.nome,
            editora: req.body.editora,
            genero: req.body.genero,
            valor: req.body.valor,
            status: "true"
        };
        docLivro.set(livro);
        res.redirect("/livros/?acao=inserir&status=true");
    }catch(e){
        console.log(e);
        res.redirect("/livros/?acao=inserir&status=false");
    }
});

// Rota da página para abrir formuário para editar os dados de um registro de livro
app.get('/editar/:id', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/livros/editar_livro.html', (e, dados) => {
                let id = req.params.id;
                const docLivro = db.ref("livros/"+id);
                docLivro.once("value", function(snapshot){
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
app.post('/editar', urlencodedParser, (req, res) => {
    try{
        let id = req.body.id;
        let nome = req.body.nome;
        let genero = req.body.genero;
        let editora = req.body.editora;
        let valor = req.body.valor;
        let docLivro = db.ref("livros");
        docLivro.child(id).update(
            {
                'nome': nome,
                'genero': genero,
                'editora' : editora,
                'valor' : valor
            }
        );
        res.redirect("/livros/?acao=editar&status=true");
    } catch (e){
        console.log(e);
        res.redirect("/livros/?acao=editar&status=false");
    }
});

// Rota da página para abrir formulário para excluir um registro de um livro
app.get('/excluir/:id', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/livros/excluir_livro.html', (e, dados) => {
                let id = req.params.id;
                const docLivro = db.ref("livros/"+id);
                docLivro.once("value", function(snapshot){
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
app.post('/excluir', urlencodedParser, (req, res) => {
    try{
        let id = req.body.id;
        const docLivro = db.ref("livros/"+id);
        docLivro.remove();
        res.redirect("/livros/?acao=excluir&status=true");
    } catch(e){
        console.log(e);
        res.redirect("/livros/?acao=excluir&status=false")
    }
});

module.exports = app;