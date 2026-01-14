// @ts-check
import { UserInformation } from './lib/definitions';
import playwright from 'playwright';
import dotenv from 'dotenv';
dotenv.config();


(async () => {
   

    const browser = await playwright.chromium.launch();
    const context = await browser.newContext({
        storageState:'playwright/.auth/user.json',
        timezoneId: 'America/Sao_Paulo',
        locale:'pt-BR'
    });
    const page = await context.newPage();
    await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'load' });


    await browser.close();

})();