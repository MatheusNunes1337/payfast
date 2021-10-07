module.exports = function(app) {

    app.post('/correios/calculo-prazo', function(req, res) {
        const dadosEntrega = req.body

        const correiosSOAPClient = new app.servicos.correiosSOAPClient();
        correiosSOAPClient.calculaPrazo(dadosEntrega, function(err, resultado) {
            if(err) {
                return res.status(500).send(err)
            } 
            console.log('prazo calculado')
            res.json(resultado)
            
        })
    })
}
