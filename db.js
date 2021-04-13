const MongoClient = require('mongodb').MongoClient;
const fs = require('fs')

const uri = "mongodb+srv://olx-scrapping:4hD7nWHFF8OaLaZN@cluster0.vi1lx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// const client = new MongoClient(uri);

/**
 * @deprecated
 * 
 */
var insertItem = async function (item) {
    console.info("Inserting item: " + item)

    await client.connect();

    const db = client.db('olx-scrapping')
    const items = db.collection('items')

    try {
        const result = await items.insertOne(item);

        console.log(
            `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
        );
    } catch (e) {
        console.error(e)
    } finally {
        await client.close()
    }
}

var insertMany = async function (listItems) {
    try {
        await client.connect();

        const db = client.db('olx-scrapping')
        const items = db.collection('items')

        const promises = listItems.map(async function(item, idx) {
            // console.info(`Looking for item: ${item.codigo}`)
            var _item = await items.findOne({
                // removido porque alguns itens estão vindo sem codigo
                // codigo: item.codigo
                link: item.link
            })

            if (_item) {
                // console.info(`Item: ${item.codigo} already sent`)
            } else {
                // if (item.codigo) {
                    // TODO verificar porque alguns anúncios estão vindo com códigos vazios
                    console.info(`Item: ${item.codigo} not found, inserting to the DB and dispatching e-mail`)
                    const result = await items.insertOne(item);
                    console.log(
                        `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
                    );

                    const resultHtml = `
                    <h1>Produto: ${item.nomeProduto}</h1>
                    <img src="${item.imagem}"/>
                    <h3>Valor: ${item.valor}</h3>
                    <h3>${item.publicacao}</h3>
                    <h3>${item.codigo}</h3>
                    <h3>Link:
                        <a href="${item.link}">Produto</a>
                    </h3>
                    <br>
                    `

                    await gerarHtml(resultHtml)
                // }
            }
        });

        await Promise.all(promises)
        console.info("Closing session")

        await client.close()
    } catch (e) {
        console.error(e)
    } finally {

    }
}

const gerarHtml = async (result) => {
    fs.writeFileSync('./index.html', result, {flag: 'a+'}, function(err) {
        if (err)
        console.error('Failed to generate e-mail: ' + err)
    });
}

module.exports.insertMany = insertMany;