// @ts-check
import playwright from 'playwright';
import dotenv from 'dotenv';
import { NA, TratativaCarta } from './lib/definitions';
dotenv.config();

const numeroAtendimento: NA = (process.env.NA_CARTAS2 ?? '').slice(0,22);
const textoBusca = 'Carta';
const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');

(async () => {

    const browser = await playwright.chromium.launch();
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json',
        timezoneId: 'America/Sao_Paulo',
        locale: 'pt-BR'
    });
    const page = await context.newPage();

    await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'networkidle' });
    await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento);
    await page.getByTitle('Pesquisar').click();
    await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${(numeroAtendimento.replace(/[^a-zA-Z0-9]/g, ''))}`);
    await page.waitForSelector('.loader-container', { state: 'hidden' });

    const lista = [];

    for (const correspondencia of await page.getByText(regexBusca).all()) {
        await correspondencia.click();
        await page.waitForSelector('.loader-container', { state: 'hidden' });
        for (const linha of await page.locator('app-tratativa table tbody tr:nth-child(n)').all()) {
            const conteudo: string[] = await linha.locator('> td').allInnerTexts();
            const args: [string, string, string, string] = conteudo as [string, string, string, string];
            const situacao = await page.locator('app-tratativa span').filter({ hasText: /(Finalizada|Cancelada|Aberta)/ }).textContent() ?? '';
            const codFornecedor = await page.getByText(args[0]).all();
            //await page.locator('app-reclamacao-fornecedor').filter({hasText:args[0]}).textContent();
            //const carta = new TratativaCarta(numeroAtendimento, situacao, 'codFornecedor', ...args);
            //const obj = carta.retornaEstrutura();
            //lista.push(obj);
            console.log(codFornecedor)
        }

    }
    //await page.screenshot({ path: `example-${playwright.chromium.name()}.png` });
    //console.log(lista)
    await browser.close();

})();