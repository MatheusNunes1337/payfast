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

    app.get('/pagamentos/pagamento/:id', function(req, res){
       const id = req.params.id;
       console.log('consultando pagamento de id: ' + id);
   
       const connection = app.persistencia.connectionFactory();
       const pagamentoDao = new app.persistencia.PagamentoDao(connection);
   
       pagamentoDao.buscaPorId(id, function(err, pagamento){
         if(err){
           console.log('erro ao consultar no banco: ' + err);
           return res.status(500).send(err);
         }
         return res.status(200).json(pagamento);
       });
     });
     
     app.get('/pagamentos/pagamento/:id', function(req, res){
      const id = req.params.id;
      console.log('consultando pagamento: ' + id);
  
      const memcachedClient = app.servicos.memcachedClient();
  
      memcachedClient.get('pagamento-' + id, function(erro, retorno){
        if (erro || !retorno){
          console.log('MISS - chave nao encontrada');
  
          const connection = app.persistencia.connectionFactory();
          const pagamentoDao = new app.persistencia.PagamentoDao(connection);
  
          pagamentoDao.buscaPorId(id, function(err, pagamento){
            if(err){
              console.log('erro ao consultar no banco: ' + err);
              return res.status(500).send(err);
            }
            console.log('pagamento encontrado: ' + JSON.stringify(pagamento));
            return res.status(200).json(pagamento);
          });
          //HIT no cache 
        } else {
          console.log('HIT - valor: ' + JSON.stringify(retorno));
          return res.status(200).json(retorno);
        }
      });
  
    });
  

    app.post("/pagamentos/pagamento",function(req, res) {
      const pagamento = req.body.pagamento;

      req.assert("pagamento.forma_de_pagamento", "Forma de pagamento é obrigatória.").notEmpty();
      req.assert("pagamento.valor", "Valor é obrigatório e deve ser um decimal.").notEmpty().isFloat();
      req.assert("pagamento.moeda", "Moeda é obrigatória e deve ter 3 caracteres").notEmpty().len(3,3);

      const errors = req.validationErrors();

      if (errors){
          console.log("Erros de validação encontrados");
          res.status(400).send(errors);
          return;
      }

      console.log('processando pagamento...');
  
      const connection = app.persistencia.connectionFactory();
      const pagamentoDao = new app.persistencia.PagamentoDao(connection);

      pagamento.status = "CRIADO";
      pagamento.data = new Date();
  
      pagamentoDao.salva(pagamento, function(exception, result){

        if(exception) {
            res.status(500).send(exception)
        }
        
        console.log('pagamento criado: ' + JSON.stringify(result));
        pagamento.id = result.insertId

        var memcachedClient = app.servicos.memcachedClient();
          memcachedClient.set('pagamento-' + pagamento.id, pagamento,
                60000, function(erro){
                  console.log('nova chave adicionada ao cache: pagamento-' + pagamento.id);
          });

        if(pagamento.forma_de_pagamento == 'cartao') {
            const cartao = req.body.cartao

            const clienteCartoes = new app.servicos.clienteCartoes()
            clienteCartoes.autoriza(cartao, function(exception, request, response, retorno) {
                if(exception) {
                  return res.status(400).send(exception)
                }

                res.location('/pagamentos/pagamento/' + result.insertId);

                pagamento.id = result.insertId;
                pagamento.valor = result.valor
        
                const uri = 'http://localhost:3000'
        
                const hateoas = {"id": pagamento.id ,"status":"CRIADO", cartao: retorno, "valor": pagamento.valor,
                "links":[
                    {"rel":" confirmar", uri: uri + "/pagamentos/pagamento/" + pagamento.id,"method":"PUT"},
                    {"rel":"cancelar", uri: uri + "/pagamentos/pagamento/" + pagamento.id,"method":"DELETE"}
                  ]
                }
  
              res.status(201).json(hateoas);

          })
        } else {

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
        }

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