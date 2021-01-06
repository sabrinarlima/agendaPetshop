const moment = require('moment')
const atendimentos = require('../controllers/atendimentos')
const conexao = require('../infraestrutura/conexao')

class Atendimento {
    adiciona(atendimento, res) {
        const dataCriacao = moment().format('YYYY-MM-DD HH:MM:SS')
        const data = moment(atendimento.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:MM:SS')

        const erros = this.valida(atendimento, data, dataCriacao);
        if (erros.length > 0) {
            res.status(400).json(erros)
        } else {

            const atendimentoDatado = { ...atendimento, dataCriacao, data }
            const sql = 'INSERT INTO Atendimentos SET ?'

            conexao.query(sql, atendimentoDatado, (erro, resultados) => {
                if (erro) {
                    res.status(400).json(erro)
                } else {
                    res.status(200).json(atendimento)
                }
            })
        }
    }

    lista(res) {
        const sql = 'SELECT * FROM Atendimentos'

        conexao.query(sql, (erro, resultados) => {
            if (erro) {
                res.status(400).json(erro)
            } else {
                res.status(200).json(resultados)
            }

        })
    }

    buscaPorId(id, res) {
        const sql = `SELECT * FROM Atendimentos WHERE id=${id}`;

        conexao.query(sql, (erro, resultados) => {
            const atendimento = resultados.length > 0 ?
                resultados[0] : undefined;
            if (erro) {
                res.status(400).json(erro);
            } else if (!atendimento) {
                res.status(404).json({ "erro": "usuário não encontrado" });
            } else {
                res.status(200).json(atendimento);
            }

        });
    }

    altera(id, valores, res) {
        if (valores.data) {
            valores.data = moment(valores.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:MM:SS')
        }

        const sql = `SELECT * FROM Atendimentos WHERE id=${id}`;
        
        conexao.query(sql, (erro, resultados) => {
            const atendimento = resultados.length > 0 ?
                resultados[0] : undefined;
            if (erro) {
                res.status(400).json(erro);
            } else if (!atendimento) {
                res.status(404).json({ "erro": "usuário não encontrado" });
            }

            const erros = this.valida(valores, valores.data, atendimento.dataCriacao);

            if(erros.length > 0) {  
                res.status(400).json(erros);
                return;
            }

            const sql = 'UPDATE Atendimentos SET ? WHERE id=?'


            conexao.query(sql, [valores, id], (erro, resultados) => {
                if (erro) {
                    res.status(400).json(erro)
                } else {
                    res.status(200).json({ ...valores, id })
                }
            });
        });
    }

    deleta(id, res) {
        const sql = 'DELETE FROM Atendimentos WHERE id=?'

        conexao.query(sql, id, (erro, resultados) => {
            if (erro) {
                res.status(400).json(erro)
            } else {
                res.status(200).json(resultados)
            }

        })
    }

    valida(atendimento, data, dataCriacao) {
        const dataValida = moment(data).isSameOrAfter(dataCriacao)
        const cliValido = atendimento.cliente.length >= 5

        const validacoes = [
            {
                nome: 'data',
                valido: dataValida,
                mensagem: 'Data deve ser maior ou igual a data atual'
            },
            {
                nome: 'cliente',
                valido: cliValido,
                mensagem: 'Cliente deve ter pelo menos 5 caracteres'
            }
        ]

        return validacoes.filter(campo => !campo.valido);
    }
}


module.exports = new Atendimento    