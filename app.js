const fs = require('fs');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const admin = require("./firebase");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'jgkagsdakg1u41t28361239209@4l21g3',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Utility function to verify token
async function verificaToken(token) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return true;
    } catch (error) {
        return false;
    }
}

// Start server
app.listen(port, () => {
    console.log('Server iniciado na porta: ', port);
});

// Route for login form
app.get('/', (req, res) => {
    fs.readFile('src/login.html', (err, data) => {
        if (err) {
            console.error('Error reading login.html:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
});

// Route for accessing main page
app.get('/acessar', async (req, res) => {
    const token = req.query.token;
    if (await verificaToken(token)) {
        req.session.authToken = token;
        res.redirect("/home");
    } else {
        res.redirect("/acesso-negado");
    }
});

// Route for registering new user
app.get('/cadastrar', (req, res) => {
    fs.readFile('src/cadastrar.html', (err, data) => {
        if (err) {
            console.error('Error reading cadastrar.html:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
});

// Route for logout
app.get('/sair', (req, res) => {
    delete req.session.authToken;
    res.redirect('/');
});

// Route for home page
app.get('/home', (req, res) => {
    if (req.session.authToken) {
        fs.readFile('src/cabecalho.html', (err1, cabecalho) => {
            if (err1) {
                console.error('Error reading cabecalho.html:', err1);
                return res.status(500).send('Internal Server Error');
            }
            fs.readFile('src/rodape.html', (err2, rodape) => {
                if (err2) {
                    console.error('Error reading rodape.html:', err2);
                    return res.status(500).send('Internal Server Error');
                }
                fs.readFile('src/index.html', (err3, dados) => {
                    if (err3) {
                        console.error('Error reading index.html:', err3);
                        return res.status(500).send('Internal Server Error');
                    }
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

// Mounting livrosRouter
const livrosRouter = require("./livrosRouter");
app.use("/livros", livrosRouter);
