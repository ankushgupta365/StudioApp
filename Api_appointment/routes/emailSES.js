const { SESClient, SendTemplatedEmailCommand } = require('@aws-sdk/client-ses');


const SES_CONFIG = {
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_SES_REGION
}

//creating new ses service object
const sesClient = new SESClient(SES_CONFIG)

// to type return accordingly
const toAccordingToType = (value)=>{
    let res = [];
    if(typeof(value) === 'object'){
        for (let val in value){
          res.push(value[val])
        }
    }else{
        res.push(value)
    }
    return res
}

const sendTemplatedEmailSES = async (to,templateName,templateData) => {
    let params = {
        Destination: { ToAddresses: toAccordingToType(to),CcAddresses: ['gurpreet.e12449@cumail.in'] },
        TemplateData: JSON.stringify(templateData),
        Source: process.env.AWS_SES_SENDER_STUDIO,
        Template: templateName,
    }

    try {
        const sendTemplateEmailCommand = new SendTemplatedEmailCommand(params)
        await sesClient.send(sendTemplateEmailCommand)
    } catch (error) {
        console.log(error)
    }
}

module.exports = sendTemplatedEmailSES