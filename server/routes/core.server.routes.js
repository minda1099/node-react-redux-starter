module.exports = function(express, app, config){
    var router = express.Router();

    app.get('/',function(req, res, next){
        res.render("index", {});
    });
    
    app.use('/', router);
}