require('dotenv').config();
const {Builder, By, Key, until} = require('selenium-webdriver');
require('chromedriver');

// bring in the twilio client from send-sms file
const client = require('./send-sms');


const driver = new Builder().forBrowser('chrome').build();

const test = async () => {
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
    await driver.wait(until.elementLocated(By.linkText('MGM National Harbor Casino Resort')), 1000).click();

    //find table of games and see what games current running
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
                            console.log(`${infoArray.join(' ')} \n`);
                        }
                });
            })
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
                            infoArray.unshift(last + ' on the waiting list for');
                            console.log(`${infoArray.join(' ')} \n`)
                        }
                    })
            })
        })
}


// #live-events > div > table > tbody > tr:nth-child(2)
// #live-events > table > tbody > tr:nth-child(1)


test();
