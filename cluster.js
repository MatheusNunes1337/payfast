    const cluster = require ('cluster');
    const os = require('os');

    const CPUS = os.cpus();
    console.log(CPUS)

    if (cluster.isMaster) {

      CPUS.forEach(function(){ 
        cluster.fork()
      });

      cluster.on("listening", worker => {
        console.log("cluster %d conectado", worker.process.pid);
      });

      cluster.on("disconnect", worker => {
        console.log("cluster %d desconectado", worker.process.pid);
      });

      cluster.on("exit", function(worker)  {
        console.log("cluster %d perdido", worker.process.pid);
        cluster.fork();
      });

    } else {
      require('./index.js');
    }