module.exports = function(app) {
    app.get('/pagamentos', function(req, res) {
        res.send('rota get de pagamentos')
    })

}