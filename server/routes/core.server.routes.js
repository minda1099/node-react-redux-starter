module.exports = function(express, app, config, path){
    var router = express.Router();

    app.get('/', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../../public') });
    });
    
    app.use('/', router);
}