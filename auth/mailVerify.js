module.exports = class {
    constructor(nodemailer) {
        this.nodemailer = nodemailer;
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.SECURITY,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            }
        })
    }

    sendVerificationMail(email, key) {
        const mailOptions = {
            from: '"Black Jack Console" <no-reply@black-jack.game>',
            to: email,
            subject: 'Verify Your Email Address', // Subject line
            html: '<p>Verify your email by clicking below<p>' + 
            `<a href="https://${process.env.HOST}:${process.env.PORT}/auth/verify/${key}">Click Me to Verify</a>` + 
            `<p>This is an automatic message sent by system, please do not reply to this message</p>`// html body
        };
        this.transporter.sendMail(mailOptions)
    }

    sendPasswordResetMail(email, key) {
        const mailOptions = {
            from: '"Black Jack Console" <no-reply@black-jack.game>',
            to: email,
            subject: 'Password Reset Request', // Subject line
            html: '<p>Reset Your password of the Black Jack Game by clicking below<p>' +
            `<p><strong>Note, please ignore this email if you did not request to change the password</strong></p>` +
            `<a href="https://${process.env.HOST}:${process.env.PORT}/password/reset/${key}">Click Me to Reset</a>` + 
            `<p>This is an automatic message sent by system, please do not reply to this message</p>`// html body
        };
        this.transporter.sendMail(mailOptions)
    }
}