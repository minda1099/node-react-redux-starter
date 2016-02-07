module.exports = function(express, app, config){
    var router = express.Router();

    router.get('/',function(req, res, next){
        res.render("index", {});
    });
    
    app.use('/', router);
}