// @ts-check
import playwright from 'playwright';
import dotenv from 'dotenv';
import { NA } from './lib/definitions';
dotenv.config();

const numeroAtendimento: NA = (process.env.NA_TESTES?? '').replace(/[^a-zA-Z0-9]/g, '');
const textoBusca = 'Carta';
const regexBusca = new RegExp(`/\[${textoBusca} -\/`,'');

(async () => {

    const browser = await playwright.chromium.launch();
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json',
        timezoneId: 'America/Sao_Paulo',
        locale: 'pt-BR'
    });
    const page = await context.newPage();
    console.log(numeroAtendimento.slice(0,17))
    await page.goto('https://proconsumidor.mj.gov.br/#/inicio', {waitUntil:'networkidle'});
    await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento);
    await page.getByTitle('Pesquisar').click();
    await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.slice(0,17)}`);
    await page.waitForSelector('.loader-container',{state:'hidden'});
    for (const correspondente of await page.getByText()) {
        
    }
    await page.screenshot({ path: `example-${playwright.chromium.name()}.png` });

    await browser.close();

})();