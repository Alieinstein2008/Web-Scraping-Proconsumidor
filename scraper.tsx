// @ts-check
import { UserInformation } from './lib/definitions';
import playwright from 'playwright';
import dotenv from 'dotenv';
dotenv.config();


(async () => {
    const user: UserInformation = {
        credential: process.env.CRENDENTIAL ?? '',
        password: process.env.PASSWORD ?? ''
    }
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://proconsumidor.mj.gov.br/#/login', { waitUntil: 'load' });
    await page.getByLabel('CPF').fill(user.credential);
    await page.getByLabel('Senha').fill(user.password);
    await page.screenshot({ path: `example-${playwright.chromium.name()}.png` });


    await browser.close();

})();