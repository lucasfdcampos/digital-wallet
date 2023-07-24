<div align="center">
  <img src="./logo.svg" alt="PicPay Logo">
  <p align="center">
  <a href="https://www.linkedin.com/in/lucasfdcampos/">
    <img alt="Made by" src="https://img.shields.io/badge/made%20by-Lucas%20Campos-%#238662">
  </a>
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/lucasfdcampos/picpay-wallet-challenge?color=%#238662">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/lucasfdcampos/picpay-wallet-challenge?color=%#238662">
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/lucasfdcampos/picpay-wallet-challenge?color=%#238662">
  </p>
</div>


# PicPay Wallet challenge

Solução para carteira digital

## Index
- [Solução](#solução)
- [Arquitetura](#arquitetura)
  * [Account](#account)
  * [Transaction](#transaction)
- [Executando](#executando)
  * [Makefile](#makefile)
  * [Manualmente](#manualmente)
  * [Utilizando as APIs](#utilizando-as-apis)
- [Testes](#testes)
- [Tecnologias](#tecnologias)
- [Escolhas técnicas](#escolhas-técnicas)
- [Swagger](#swagger)

## Solução
Esta solução consiste em dois microsserviços onde é possível realizar as seguintes operações:

- Cadastro de conta
  - Obter conta
- Cadastro de _wallet_
  - Obter _wallet_
- Extrato (_history_)
- Transações: depósito, retirada, compra, cancelamento e estorno
- Listagem de transações
  - Obter transação
- Listagem de auditoria

## Arquitetura

![image info](./architecture.png)

Conforme a figura acima, toda estrutura está em containers *Docker onde* temos dois microsserviços: _Account_ e _Transaction_. Ambos serviços se conectam e trocam eventos através do Apache Kafka e cada um tem seu próprio banco de dados PostgreSQL para persistencia e fonte de dados. O serviço _Transaction_ se conecta ao MongoDB para salvar dados de auditoria.

Ambos serviços estão conectados ao Kong API-Gateway.

### Account

Esse serviço é responsável por cadastrar uma conta e as _wallets_ dessa conta, consultar o extrato (_history_), consulta da _wallet_ (saldo) e envio de eventos de algumas transações para o serviço _Transaction_ como: depósito, compra e saque (retirada).

Este serviço recebe um evento de atualizações de saldo e que também cria históricos de movimentações.

### Transaction

Esse serviço é responsável por receber e procesar eventos de transações que foram enviadas pelo Account e também criar transações de cancelamento e estorno. O _transaction_ também contém listagem de transações e de auditoria. 

Todo envio de eventos são enviados pelo Apache Kafka e salvos no banco de dados PostgreSQL. A cada transacão recebida é gerado uma auditoria com MongoDB.

A premissa é que o Account seja um serviço mais “voltado ao cliente”, onde faria operações (transações) que teria mais controle, como: depósito, saque e efetuar compras. Já o serviço de Transaction seria um processamento das transações com a possibilidade da Companhia cancelar ou efetuar estornos, listar as transações e verificar dados de auditoria.

**Cancelamento**

Coloquei como regra para o Cancelamento que faça apenas para _transactions_ do tipo _PURCHASE_ (compra) e somente quando for último registro de compra. Assim ele gera um registro de _transaction_ do tipo _CANCELLATION_ e retorna o valor ao saldo da conta.

**Estorno**

O Estorno contém a mesma regra, porém é possível estornar qualquer transação do tipo _PURCHASE_, sem ser a ultima necessariamente.

## Executando

### Makefile

O comando abaixo irá subir todos os serviços Docker necessários:

```bash
make up-all
```

### Manualmente

Caso prefira subir o ambiente sem o _Makefile_ acima:

```bash
docker network create picpay-net
docker-compose up -d
```

### Utilizando as APIs

Pode ser importado as collections do Insomnia (<span style="color:gray">made by Kong</span>) ou utilizar os comandos diretamente no terminal. É necessário ter o curl instalado!


<a href="https://insomnia.rest/run/?label=&uri=https%3A%2F%2Fraw.githubusercontent.com%2Flucasfdcampos%2Fpicpay-wallet-challenge%2Fmaster%2FInsomnia.json" target="_blank"><img src="https://insomnia.rest/images/run.svg" alt="Run in Insomnia"></a>



#### Criando _account_

```bash
curl --request POST \
  --url http://localhost:8000/v1/account \
  --header 'Content-Type: application/json' \
  --data '{
	"name": "Jane Smith",
	"email": "jane.smith@picpay.com"
}'
```

#### Buscando _account_ por _id_

```bash
curl --request GET \
  --url http://localhost:8000/v1/account/<id>
```

#### Criando _wallet_
```bash
curl --request POST \
  --url http://localhost:8000/v1/wallet \
  --header 'Content-Type: application/json' \
  --data '{
	"accountId": "<account_id>"
}'
```

#### Buscando _wallet_ por _id_
```bash
curl --request GET \
  --url http://localhost:8000/v1/wallet/<id>
```

#### Enviar trasação de _deposit_, _purchase_ ou _withdraw_
```bash
curl --request POST \
  --url http://localhost:8000/v1/wallet/<wallet_id>/transactions \
  --header 'Content-Type: application/json' \
  --data '{
	"type": "deposit",
	"value": 100
}'
```

#### Listar extrato (_history_)
```bash
curl --request GET \
  --url 'http://localhost:8000/v1/history?walletId=<wallet_id>&createdAtStart=2023-07-19&createdAtEnd=2023-07-23'
```

#### Buscar _history_ por _id_
```bash
curl --request GET \
  --url http://localhost:8000/v1/history/<history_id>
```

#### Buscar _transaction_ por _id_
```bash
curl --request GET \
  --url http://localhost:8000/v1/transaction/<transaction_id>
```

#### Listar _transactions_
```bash
curl --request GET \
  --url 'http://localhost:8000/v1/transaction?walletId=<wallet_id>&createdAtStart=2023-07-19&createdAtEnd=2023-07-23'
```

#### Enviar cancelamento
```bash
curl --request POST \
  --url http://localhost:8000/v1/transaction/cancel/<transaction_id>
```

#### Enviar estorno
```bash
curl --request POST \
  --url http://localhost:8000/v1/transaction/reverse/<transaction_id>
```

#### Listar auditoria
```bash
curl --request POST \
  --url http://localhost:8000/v1/transaction/reverse/<transaction_id>
```

## Testes
Para os testes é necessário passar algumas variáveis ambiente para conexão com PostgreSQL e MongoDB, mas já enviei preenchidas. Estes são encontrados em 
``services/*/.env`` . **Não é correto enviar as secrets** - mas por ser um projeto challenge acabei enviando.
```env
DB_TEST_HOST=localhost
DB_TEST_USER=admin
DB_TEST_PASSWORD=admin
DB_TEST_DATABASE=transaction
MONGO_URL_TEST=mongodb://admin:example@localhost/db_audit?authSource=db_audit
```


```bash
make run-unit-tests
```

## Tecnologias
- Docker
- NestJS
- Apache Kafka
- PostgreSQL
- MongoDB
- Kong API-Gateway
- TypeORM

## Escolhas técnicas

#### Clean code
Procurei ao máximo deixar as classes e métodos com atribuições únicas e com escopo reduzido, com apenas uma única funcionalidade e objetivo. O NestJs contém um pattern padrão que contribui para esta premissa.

#### Microservice
Arquitetura escolhida pela escabilidade, modularidade, elasticidade, tolerância a falhas, testabilidade e confiabilidade.

#### Api-Gateway
Uma Api-Gateway entrega muitas vantagens, neste pequeno projeto serve para direcionar as requests para o microservice adequado.

#### Event-Driven
Trabalhar com _microservices_ pode ser muito complexo dependendo do domínio da aplicação. Um dos grandes problemas desta arquitetura são as chamadas síncronas entre serviços, que podem gerar lentidão no sistema como um todo ou folharem devido a problemas de rede. Event-Driven é descrito por Mark Richards e Neal Ford em [Fundamentals of Software Architecture: An Engineering Approach](https://www.goodreads.com/book/show/44144493-fundamentals-of-software-architecture) como uma `arquitetura`. Nesta arquitetura, cada _transaction_ gera um evento e este será usado por outra ação que também irá gerar um evento e assim por diante.

Devido a esta característica, _microservices_ "casam" bem como uma arquitetura baseada em eventos, pois os erros de rede são drasticamente diminuídos e tudo acontece de forma assíncrona.

## Swagger

A documentação _Swagger_ está divida entre os _microservices_

#### _Account_
```bash
http://localhost:3000/swagger
```

#### _Transaction_
```bash
http://localhost:3010/swagger
```