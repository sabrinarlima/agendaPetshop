const fs = require('fs');
const path = require('path')



module.exports = (caminho, nomeDoArquivo, callbackimagemCriada) => {

    const tiposValidos = ['jpg', 'png', 'jpeg']
    const tipo = path.extname(caminho)
    const tipoValido = tiposValidos.indexOf(tipo.substring(1)) !== -1

    if (tipoValido) {

        const novoCaminho = `./assets/imagens/${nomeDoArquivo}${tipo}`

        fs.createReadStream(caminho)
            .pipe(fs.createWriteStream(novoCaminho))
            .on('finish', () => callbackimagemCriada(false, novoCaminho))
    } else { 
        const erro = 'tipo é inválido'
        console.log('Erro! Tipo da imagem inválido')
        callbackimagemCriada(erro)
    }


}


