module.exports = function(express, app, config){
    var router = express.Router();

    app.get('/',function(req, res, next){
        res.render("index", {});
    });
    // Catch all route to handle all SPA requests (last in routes list)
    app.get('*', function(req, res) {
        res.render("index", {});
    });
    app.use('/', router);
}