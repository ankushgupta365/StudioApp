const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (req, res, to, subject, templateId, dynamicTemplateData) => {
    const msg = {
        to: to,
        from: 'ankushgupta0365@gmail.com',
        subject,
        templateId,
        dynamicTemplateData
    };
    try {
        await sgMail.send(msg)
    } catch (error) {
        // res.status(500).json({ msg: "there is some error", err: error.message })
        console.log("error "+error)
        console.log("message "+error.message)
    }
}

module.exports = sendEmail