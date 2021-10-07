const fs = require('fs')

fs.readFile('naruto.jpg', (err, buffer) => {
    console.log('imagem lida')
    fs.writeFile('naruto01.jpg', buffer, () => {
        console.log('arquivo escrito')
    })
})