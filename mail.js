const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const fs = require('fs')

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key:
            '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'
        }
    })
)

const deleteReport = () => {
    try {
        fs.unlinkSync('./index.html');
        console.info("File deleted!");
    } catch (e) {
        console.error(`Failed to delete file. Error: ${e}`)
    }
}

const sendMail = () => {
    console.info('Dispatching e-mail')
    transporter.sendMail({
        to: 'pvlobato@gmail.com',
        from: 'pvlobato@gmail.com',
        subject: 'OLX_SCRAPPING_BOT: Novos Anúncios de TV em Belém/PA',
        html: ({path: './index.html'})
    })
}

const main = async() => {
    await sendMail();
    await deleteReport();
}

main();