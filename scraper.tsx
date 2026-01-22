// @ts-check
import playwright from 'playwright';
import dotenv from 'dotenv';
import { NA, TratativaCarta } from './lib/definitions';
dotenv.config();

const numeroAtendimento: NA = (process.env.NA_CARTAS1 ?? '').slice(0, 22);
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
        const situacaoCarta = await page.locator('app-tratativa span').filter({ hasText: /(Finalizada|Cancelada|Aberta)/ }).textContent() ?? '';
        await page.waitForSelector('.loader-container', { state: 'hidden' });

        for (const linha of await page.locator('app-tratativa table tbody tr:nth-child(n)').all()) {
            const conteudo: string[] = await linha.locator('> td').allInnerTexts();
            const args: [string, string, string, string] = conteudo as [string, string, string, string];
            const cd = await page.locator('app-reclamacao-fornecedor div.row.mb-2').filter({has:page.locator('div.col-md-3', {hasText:args[0]})});
            const codFornecedor = await cd.locator('input').nth(1).inputValue(); 
            const carta = new TratativaCarta(numeroAtendimento, situacaoCarta, codFornecedor.slice(22,24), ...args);
            const obj = carta.retornaEstrutura();
            lista.push(obj);
        }

    }
    console.log(lista)
    await browser.close();

})();