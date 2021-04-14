const url = 'https://pa.olx.com.br/regiao-de-belem/belem/audio-tv-video-e-fotografia/tvs?sf=1'

const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const express = require('express');
const app = express();
const insertMany = require('./db').insertMany
const sendMail = require('./mail').sendMail
const deleteReport = require('./mail').deleteReport
var CronJob = require('cron').CronJob;

const dados = []

const rawData = async () => {
    try {
        const res = await axios.get(url)

        return res.data
    }

    catch (e) {
        console.error('Failed to extract raw data: ' + e)
    }
}

const links = async () => {
    const html = await rawData();
    const $ = await cheerio.load(html)

    $('.fnmrjs-0.fyjObc').each(function(i, lnk) {
        dados[i] = $(lnk).attr('href')
    });

    return dados
}

const coletaDados = async (pg) => {
    try {
        //console.info(`Coletando dados do link: ${pg}`)
        const res = await axios.get(pg);
        const html = res.data;
        const $ = await cheerio.load(html)

        let nomeProduto = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.jAHFXn > div.h3us20-6.chzacc > h1').text()
        let valor = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.cpscHx > div:nth-child(7) > div > div.sc-hmzhuo.dtdGqP.sc-jTzLTM.iwtnNi > div.sc-hmzhuo.sc-12l420o-0.kUWFYY.sc-jTzLTM.iwtnNi > h2').text()
        let publicacao = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.jAHFXn > div.h3us20-6.eQxFPs > div.h3us20-2.bdQAUC > div > span.sc-1oq8jzc-0.jvuXUB.sc-ifAKCX.fizSrB').text()
        let codigo = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.jAHFXn > div.h3us20-6.eQxFPs > div.h3us20-2.bdQAUC > div > span.sc-16iz3i7-0.qJvUT.sc-ifAKCX.fizSrB').text()
        let imagem = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.jAHFXn > div.h3us20-6.dBUmvT > div > div > div.sc-28oze1-1.gnyoQn > div > div.sc-28oze1-3.zSAIq > div:nth-child(1) > img').attr('src')

        const resultHtml = `
        <h1>Produto: ${nomeProduto}</h1>
        <h3>Valor: ${valor}</h3>
        <h3>${publicacao}</h3>
        <h3>${codigo}</h3>
        <h3>Link:
            <a href="${pg}">Produto</a>
        </h3>
        <br>
        `

        var resultJson = new Object();

        resultJson.nomeProduto = nomeProduto
        resultJson.imagem = imagem
        resultJson.publicacao = publicacao
        resultJson.valor = valor
        resultJson.codigo = codigo
        resultJson.link = pg

        if (!codigo) {
            //console.info("Blank code for item: " + pg)
        }

        // gerarHtml(result);

        return resultJson
    } catch (e) {
        console.error(`Failed to collect data for item: ${codigo}. ERROR: ${e}`)
    }
}

const gerarHtml = async (result) => {
    fs.writeFileSync('./index.html', result, {flag: 'a+'}, function(err) {
        if (err)
        console.error('Failed to generate e-mail: ' + err)
    });
}

const showDados = async () => {
    console.info("=== Generating data...")
    const allLinks = await links();
     
    // allLinks.map(function(linksFilhos) {
    //     coletaDados(linksFilhos)
    // });

    let jsonItems = await Promise.all(allLinks.map(async function(linksFilhos) {
        return await coletaDados(linksFilhos)
    }));

    try {
        await insertMany(jsonItems)
    } catch (e) {
        console.error(e)
    }

}

const main = async () => {

    showDados()
    .then(() => sendMail())
    // .then(() => deleteReport())
    .then(() => { console.log("\n===Finished everything===") })

}

const sentry = async () => {
    console.info('Poking Web scrapper... you in there, budy? Don\'t you sleep!')
    try {
        var response = await axios.get('https://olx-scrapping.herokuapp.com/')
    } catch (e) {
        console.error(`Error during Sentry call. Error: ${e.response.status}`)
    }
}

main();

var job = new CronJob('*/20 * * * *', function() {
    main();
  }, null, true, 'America/Los_Angeles');
job.start();

var sentryJob = new CronJob('*/15 * * * *', function() {
    sentry();
  }, null, true, 'America/Los_Angeles');
sentryJob.start();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.info("Server running on port 3000")
});
