const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//function for sending welcome email
const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
    to: email,
    from: 'akkouh.imrane@gmail.com',
    subject: `Welcome ${name}`,
    text: `Welcome Mr/Ms ${name}, Please share with us your thoughts on the app.`,
})
}

//function for sending goodbye email
const sendGoodByeEmail = (email, name)=>{
    sgMail.send({
    to: email,
    from: 'akkouh.imrane@gmail.com',
    subject: `GoodBye ${name}`,
    text: `GoodBye Mr/Ms ${name}, Can you Please share with us your reason to leave the app, so we can make it better?.`,
})
}

module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail
}
