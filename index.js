const url = 'https://pa.olx.com.br/regiao-de-belem/belem/audio-tv-video-e-fotografia/tvs?sf=1'

const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

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
        const res = await axios.get(pg);
        const html = res.data;
        const $ = await cheerio.load(html)

        let nomeProduto = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.jAHFXn > div.h3us20-6.chzacc > h1').text()
        let valor = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.cpscHx > div:nth-child(7) > div > div.sc-hmzhuo.dtdGqP.sc-jTzLTM.iwtnNi > div.sc-hmzhuo.sc-12l420o-0.kUWFYY.sc-jTzLTM.iwtnNi > h2').text()
        let publicacao = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.jAHFXn > div.h3us20-6.eQxFPs > div.h3us20-2.bdQAUC > div > span.sc-1oq8jzc-0.jvuXUB.sc-ifAKCX.fizSrB').text()
        let codigo = $('#content > div.sc-18p038x-3.dSrKbb > div > div.sc-bwzfXH.h3us20-0.cBfPri > div.duvuxf-0.h3us20-0.jAHFXn > div.h3us20-6.eQxFPs > div.h3us20-2.bdQAUC > div > span.sc-16iz3i7-0.qJvUT.sc-ifAKCX.fizSrB').text()

        const result = `
        <h1>Produto: ${nomeProduto}</h1>
        <h3>Valor: ${valor}</h3>
        <h3>${publicacao}</h3>
        <h3>${codigo}</h3>
        <h3>Link:
            <a href="${pg}">Produto</a>
        </h3>
        <br>
        `
        gerarHtml(result);
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
     const allLinks = await links();
     
     allLinks.map(function(linksFilhos) {
        coletaDados(linksFilhos)
     });
}

const main = async () => {
    await showDados();
}

main();