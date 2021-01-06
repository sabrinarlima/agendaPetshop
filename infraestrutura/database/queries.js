const { query } = require('./conexao')
const conexao = require('./conexao')

const executaQuery = (query, parametros = '') => {
    return conexao.query = (query, parametros = '') => {
        return new Promise((resolve, reject) => {
            conexao.query(query, parametros, (erros, parametros, campos) => {
                if (erros) {
                    reject(erros)
                } else {
                    resolve(resultados)
                }

            })
        })

    }
}