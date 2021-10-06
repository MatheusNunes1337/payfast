const PagamentoDao = require("../persistencia/PagamentoDao");

module.exports = function(app) {
    app.get('/pagamentos', function(req, res) {

      const connection = app.persistencia.connectionFactory();
      const pagamentoDao = new app.persistencia.PagamentoDao(connection);

      pagamentoDao.lista(function(err, pagamentos){
          if(err) {
            return res.status(400).send(err)
          }
          res.status(200).json(pagamentos)
      })
    })

    app.post("/pagamentos/pagamento",function(req, res) {
      var pagamento = req.body;

      req.assert("forma_de_pagamento", "Forma de pagamento é obrigatória.").notEmpty();
      req.assert("valor", "Valor é obrigatório e deve ser um decimal.").notEmpty().isFloat();
      req.assert("moeda", "Moeda é obrigatória e deve ter 3 caracteres").notEmpty().len(3,3);

      var errors = req.validationErrors();

      if (errors){
          console.log("Erros de validação encontrados");
          res.status(400).send(errors);
          return;
      }

      console.log('processando pagamento...');
  
      var connection = app.persistencia.connectionFactory();
      var pagamentoDao = new app.persistencia.PagamentoDao(connection);

      pagamento.status = "CRIADO";
      pagamento.data = new Date();
  
      pagamentoDao.salva(pagamento, function(exception, result){

        if(exception) {
            res.status(500).send(exception)
        }
        
        console.log('pagamento criado: ' + result);

        res.location('/pagamentos/pagamento/' + result.insertId);

        pagamento.id = result.insertId;
        pagamento.valor = result.valor

        const uri = 'http://localhost:3000'

        const hateoas = {"id": pagamento.id ,"status":"CRIADO","valor": pagamento.valor,
        "links":[
          {"rel":" confirmar", uri: uri + "/pagamentos/pagamento/" + pagamento.id,"method":"PUT"},
          {"rel":"cancelar", uri: uri + "/pagamentos/pagamento/" + pagamento.id,"method":"DELETE"}
        ]
      }

        res.status(201).json(hateoas);
      });
    });

    app.put('/pagamentos/pagamento/:id', function(req, res){

    let pagamento = {};
    const id = req.params.id;

    pagamento.id = id;
    pagamento.status = 'CONFIRMADO';

    const connection = app.persistencia.connectionFactory();
    const pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.atualiza(pagamento, (err) => {
        if (err){
          return res.status(500).send(err);
        }
        res.status(204).json(pagamento);
    });

  });

  app.delete('/pagamentos/pagamento/:id', function(req, res){
    let pagamento = {};
    const id = req.params.id;

    pagamento.id = id;
    pagamento.status = 'CANCELADO';

    const connection = app.persistencia.connectionFactory();
    const pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.atualiza(pagamento, function(err){
        if (err){
          return res.status(500).send(err);
        }
        res.status(204).send(pagamento);
    });
  });

}