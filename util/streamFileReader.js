const fs = require('fs')

fs.createReadStream('naruto.jpg')
.pipe(fs.createWriteStream('naruto02.jpg'))
.on('finish', () => {
    console.log('arquivo escrito com sucesso')
})