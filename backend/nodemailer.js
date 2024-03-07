const nodeMailer = require('nodemailer');

async function main() {
    try {
        const transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'okanga.fidel@gmail.com',
                pass: 'doin luda ynds ejjp'
            },
            "tls": {
                "minVersion": "TLSv1.3"
            }
            
        });
        

        const html = '<p>Hello, this is a test email.</p>'; 
        const info = await transporter.sendMail({
            from: 'munchhotel@gmail.com',
            to: 'oumabarack1047@gmail.com', 
            subject: 'Hi barrack, welcome to munch hotel your order has been received and will be delivered in 15 minutes.Thank you and welcome again!!',
            html: html,
        });

        console.log("Message sent: " + info.messageId);
    } catch (error) {
        console.log(error);
    }
}

main();
