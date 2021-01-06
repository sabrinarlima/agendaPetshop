const { default: axios } = require('axios')
const moment = require('moment')
const atendimentos = require('../controllers/atendimentos')
const conexao = require('../infraestrutura/database/conexao')
const repositorio = require('../repositorios/atendimento')

class Atendimento {
    constructor() {
        this.dataValida = (data, dataCriacao) => moment(data).isSameOrAfter(dataCriacao)
        this.cliValido = (tamanho) => tamanho >= 5
        this.valida = (parametros) => this.validacoes.filter(campo => {
            const {nome} = campo
            const parametro = parametros[nome]

            return !campo.valido(parametro)
        })
        this.validacoes = [
            {
                nome: 'data',
                valido: this.dataValida,
                mensagem: 'Data deve ser maior ou igual a data atual'
            },
            {
                nome: 'cliente',
                valido: this.cliValido,
                mensagem: 'Cliente deve ter pelo menos 5 caracteres'
            }
        ]

    }
    adiciona(atendimento) {
        const dataCriacao = moment().format('YYYY-MM-DD HH:mm:ss')
        const data = moment(atendimento.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss')


        const parametros = {
            data: {data, dataCriacao},
            cliente:{tamanho: atendimento.cliente.length}
        }
        const erros = this.valida(parametros);



        if (erros.length > 0) {
            return new Promise((reject) => reject(erros))
        } else {
            const atendimentoDatado = { ...atendimento, dataCriacao, data }

            return repositorio.adiciona(atendimentoDatado)
                .then(resultados => {
                    const id = resultados.insertId
                    return ({ ...atendimento, id })
                })
        }
    }

    lista(res) {
        return repositorio.lista()
    }

    buscaPorId(id, res) {
        const sql = `SELECT * FROM Atendimentos WHERE id=${id}`;

        conexao.query(sql, async (erro, resultados) => {
            const atendimento = resultados.length > 0 ?
                resultados[0] : undefined;
            const cpf = atendimento.cliente
            if (erro) {
                res.status(400).json(erro);
            } else if (!atendimento) {
                res.status(404).json({ "erro": "usuário não encontrado" });
            } else {
                const { data } = await axios.get(`http://localhost:8082/${cpf}`)
                atendimento.cliente = data
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

            if (erros.length > 0) {
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

        return validacoes.filter(campo => !campo.valido);
    }
}


module.exports = new Atendimento    