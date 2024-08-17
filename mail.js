// 短信推送服务
const nodemailer = require("nodemailer");
const {GetSCV, FilterUserGoods} = require("./csv");
const ejs = require("ejs");

const transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "1430513000@qq.com",
        pass: "habrhomfxpopicee",
    },
});

const sendMail = (title,mailMsg, html) => transporter.sendMail({
    from: '"优衣库限时折扣🔥" <1430513000@qq.com>', // sender address
    to: mailMsg, // list of receivers
    subject: title, // Subject line
    html: html, // html body
},(error, info)=>{
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId)
});


function UserLi(){
    // 数组生成器
    function* batchGenerator(array, batchSize) {
        for (let i = 0; i < array.length; i += batchSize) {
            yield array.slice(i, i + batchSize);
        }
    }

    GetSCV('csv/users.csv').then(data=>{
        const largeArray = data;
        const batchGeneratorFunc = batchGenerator(largeArray, 5);
        let index = 0;
        let title = '8月8日-8月15日'
        for (const batch of batchGeneratorFunc) {
            batch.map(async user => {
                let sex = user.sex.toString().split(',')
                let data = await FilterUserGoods(sex)
                let html = await ejs.renderFile('ejs/mail.ejs', {title: title, data })
                await sendMail(title,user.email, html,)
            })
            index++
            // 处理当前批次的数据
            console.log('当前批次：', index,batch);
        }

    })
}
UserLi()


module.exports = sendMail
