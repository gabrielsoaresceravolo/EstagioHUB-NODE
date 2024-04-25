const admin = require("./firebase");
const firebase = admin.auth();

function auth(req, res, next)
{
    const user = firebase.currentUser;
    if(user)
        next();
    else
        res.redirect("/acesso-negado");
}

module.exports = auth;