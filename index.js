require('dotenv').config();
const {Builder, By, Key, until} = require('selenium-webdriver');
require('chromedriver');

// bring in the twilio client from send-sms file
const client = require('./send-sms');


const driver = new Builder().forBrowser('chrome').build();

let textBody = '';

const test = async (casino, stakes) => {
    //login
    await driver.get('https://www.bravopokerlive.com/venues');
    await driver.findElement(By.css('.btn-danger')).click();
    await driver.sleep(500);
    await driver.findElement(By.id('signin-email')).click();
    await driver.findElement(By.id('Email')).sendKeys('notontilt09@gmail.com');
    await driver.sleep(500);
    await driver.findElement(By.id('Password')).sendKeys('xxxxxxxx');
    await driver.findElements(By.css('.btn-danger')).then(results => results[1].click());

    //go to favorites page
    await driver.wait(until.elementLocated(By.linkText('Favorites')), 1000).click();

    //click on casino
    await driver.wait(until.elementLocated(By.linkText(casino)), 1000).click();

    // setup body of text message to be sent

    //find table of games and see what games current running, send text message if matching game exists
    await driver.findElements(By.css('#live-events > div > table > tbody > tr'))
        .then(elements => {
            elements.map(result => {
                result.getText()
                    .then(text => {
                        if (text && !text.includes('Current Live Games')) {
                            const infoArray = text.split(' ');
                            const last = infoArray.pop();
                            last === '1' ? infoArray.unshift(last + ' table of') : infoArray.unshift(last + ' tables of');
                            infoArray[infoArray.length - 1] = infoArray[infoArray.length - 1] + ' running';
                            info = infoArray.join(' ');
                            for (let i = 0; i < stakes.length; i++) {
                                if (info.includes(stakes[i])) {
                                    textBody += ' *** ' + info
                                }
                            }
                        }  
                    })
            });
        });  
    
    // grab wait lists
    await driver.findElements(By.css('#live-events > table > tbody > tr'))
        .then(elements => {
            elements.map(result => {
                result.getText()
                    .then(text => {
                        if (text && !text.includes('Current Waiting List')) {
                            const infoArray = text.split(' ');
                            const last = infoArray.pop()
                            infoArray.unshift(last + ' waiting for');
                            info = infoArray.join(' ')
                            for (let i = 0; i < stakes.length; i++) {
                                if (info.includes(stakes[i])) {
                                    textBody += ' *** ' + info;
                                }
                            }
                        }
                    })
            })
        })
}



const run = async () => {
    await test('MGM National Harbor Casino Resort', ['10-25 NLH', '5-10 NLH']);
    // setTimeout(() => console.log(textBody), 1000);
    setTimeout(() => {
        client.messages.create({
            to: process.env.MY_PHONE,
            from: process.env.TWILIO_PHONE,
            body: `MGM National Harbor Casino Resort INFO: \n ${textBody}`
        })
        .then(message => console.log(message.sid));
    }, 1000); 
}

run();




