const fs = require('fs');

fs.createReadStream('./assets/cachorrin.jpg')
    .pipe(fs.createWriteStream('./assets/cachorrin-stream.jpg'))
    .on('finish', () => console.log('imagem escrita com sucesso'))
