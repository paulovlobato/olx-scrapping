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
    file = './index.html'
    console.info("=== Deleting report...")
    if (fs.existsSync(file)) {
        //file exists
        try {
            fs.unlinkSync('./index.html');
            console.info("File deleted!");
        } catch (e) {
            console.error(`Failed to delete file. Error: ${e}`)
        }
    } else {
        console.info("No report file to delete")
    }
}

const sendMail = () => {
    file = './index.html'
    console.info('=== Dispatching e-mail')
    if (fs.existsSync(file)) {
        transporter.sendMail({
            to: 'pvlobato@gmail.com',
            from: 'pvlobato@gmail.com',
            subject: 'OLX_SCRAPPING_BOT: Novos Anúncios de TV em Belém/PA',
            html: ({path: './index.html'})
        })
        console.info('E-mail dispatched!')
    } else {
        console.info("No e-mail to dispatch")
    }
}

module.exports.sendMail = sendMail;
module.exports.deleteReport = deleteReport;