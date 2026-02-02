// @ts-check
import playwright from 'playwright';
import dotenv from 'dotenv';
import { NumeroAtendimento, TratativaCarta } from './lib/definitions';
import xlsx from "xlsx";

dotenv.config();

const textoBusca = 'Carta';
const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');

const listaDeNa = [
    "22.12.0532.001.00390-301",
    "22.12.0532.001.00146-301",
    "22.12.0532.001.00015-301",
    "22.12.0532.001.00034-301",
    "22.12.0532.001.00064-301",
    "22.12.0532.001.00072-301",
    "22.12.0532.001.00084-301",
    "22.12.0532.001.00104-301",
    "22.12.0532.003.00008-301",
    "22.12.0532.003.00016-301",
    "22.12.0532.003.00022-301",
    "22.12.0532.003.00022-302",
    "22.12.0532.003.00004-301",
    "22.12.0532.003.00017-301",
    "22.12.0532.004.00013-301",
    "22.12.0532.004.00011-302",
    "22.12.0532.004.00016-301",
    "22.12.0532.004.00012-301",
    "22.12.0532.004.00011-301",
    "22.12.0532.004.00017-301",
    "22.12.0532.004.00008-301",
    "22.12.0532.004.00015-302",
    "22.12.0532.004.00010-301",
    "22.12.0532.001.01348-301",
    "22.12.0532.001.00484-301",
    "22.12.0532.001.00349-301",
    "22.12.0532.001.00684-301",
    "22.12.0532.001.00438-301",
    "22.12.0532.001.01084-301",
    "22.12.0532.001.00686-301",
    "22.12.0532.001.00738-301",
    "22.12.0532.001.00468-301",
    "22.12.0532.001.00429-303",
    "22.12.0532.001.00081-301",
    "22.12.0532.001.00269-301",
    "22.12.0532.001.00278-301",
    "22.12.0532.001.00724-301",
    "22.12.0532.001.01049-301",
    "22.12.0532.001.01078-301",
    "22.12.0532.001.01091-302",
    "22.12.0532.001.00036-301",
    "22.12.0532.004.00024-301",
    "22.12.0532.004.00020-302",
    "22.12.0532.004.00015-301",
    "22.12.0532.004.00022-301",
    "22.12.0532.004.00021-301",
    "22.12.0532.004.00026-301",
    "22.12.0532.004.00006-301",
    "22.12.0532.004.00004-301",
    "22.12.0532.004.00005-301",
    "22.12.0532.004.00009-301",
    "22.12.0532.004.00025-301",
    "22.12.0532.004.00006-302",
    "22.12.0532.004.00023-301",
    "22.12.0532.004.00020-301",
    "22.12.0532.006.00009-301",
    "22.12.0532.001.00055-302",
    "22.12.0532.001.00067-302",
    "22.12.0532.001.00071-301",
    "22.12.0532.001.00128-301",
    "22.12.0532.001.00229-301",
    "22.12.0532.001.00267-301",
    "22.12.0532.001.00443-301",
    "22.12.0532.001.00449-301",
    "22.12.0532.001.00576-301",
    "22.12.0532.001.01073-301",
    "22.12.0532.001.00554-301",
    "22.12.0532.001.01146-301",
    "22.12.0532.001.00105-301",
    "22.12.0532.001.00948-301",
    "22.12.0532.001.01092-302",
    "22.12.0532.001.01038-301",
    "22.12.0532.001.01326-302",
    "22.12.0532.001.00626-301",
    "22.12.0532.001.00656-301",
    "22.12.0532.001.00689-301",
    "22.12.0532.001.00781-301",
    "22.12.0532.001.00892-301",
    "22.12.0532.001.00904-301",
    "22.12.0532.001.00932-301",
    "22.12.0532.001.01052-301",
    "22.12.0532.001.01065-301",
    "22.12.0532.001.01079-301",
    "22.12.0532.001.01152-301",
    "22.12.0532.001.01467-301",
    "22.12.0532.001.01475-301",
    "22.12.0532.001.00067-301",
    "22.12.0532.001.01047-301",
    "22.12.0532.001.00768-301",
    "22.12.0532.001.00210-301",
    "22.12.0532.001.01315-301",
    "22.12.0532.001.01003-301"];


(async () => {

    console.time("Tempo-de-Execução-Total");
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json',
        timezoneId: 'America/Sao_Paulo',
        locale: 'pt-BR'
    });
    const page = await context.newPage();

    const lista = [];
    var cont = 0;

    for (const NA of listaDeNa) {

        const inicio = performance.now();
        await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'networkidle' });
        const numeroAtendimento = new NumeroAtendimento(NA);
        await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento.Formatacao(1));
        await page.getByTitle('Pesquisar').click();

        try {
            await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.Formatacao(2)}`);
            await page.waitForSelector('.loader-container', { state: 'hidden' });

            //Abre o painel suspenso de tratativas caso esteja fechado/recolhido
            if (!await page.locator('app-tratativa').isVisible()) {
                await page.getByTitle('Clique para Expandir/Recolher').filter({ hasText: "Tratativas" }).click();
            }

            for (const correspondencia of await page.getByText(regexBusca).all()) {

                await correspondencia.click();
                await page.waitForSelector('.loader-container', { state: 'hidden' });
                const situacaoCarta = await page.locator('app-tratativa span').filter({ hasText: regexSituacao }).textContent() ?? '';

                for (const linha of await page.locator('app-tratativa table tbody tr:nth-child(n)').all()) {
                    const conteudoLinha: string[] = await linha.locator('> td').allInnerTexts();
                    const args: [string, string, string, string] = conteudoLinha as [string, string, string, string];
                    const fornecedor = page.locator('app-reclamacao-fornecedor div.row.mb-2').filter({ has: page.locator('div.col-md-3', { hasText: args[0] }) });
                    const fornecedorCodigo = await fornecedor.locator('input').nth(1).inputValue();
                    const fornecedorCNPJ = await fornecedor.locator('input').nth(3).inputValue();
                    const carta = new TratativaCarta(numeroAtendimento.Formatacao(1), situacaoCarta, fornecedorCodigo.slice(22, 24), fornecedorCNPJ, ...args);
                    const estrutura = carta.retornaEstrutura(1);
                    lista.push(estrutura);

                }

            }
            const fim = performance.now();
            const time = ((fim - inicio) / 1000).toFixed(2);
            console.log(`NA: ${numeroAtendimento.Formatacao(1)} Tempo de Execução: ${time}s  ✅  ${cont + 1}°`);
            cont++;


        } catch (error) {
            const fim = performance.now();
            const time = ((fim - inicio) / 1000).toFixed(2);
            console.log(`NA: ${numeroAtendimento.Formatacao(1)} Tempo de Execução: ${time}s ❌  ${cont + 1}°`);
            cont++;
            lista.push(`Erro na NA ${numeroAtendimento.Formatacao(1)}`);
            continue;
        }

    }

    //const worksheet = xlsx.utils.json_to_sheet(lista);
    //const workbook = xlsx.utils.book_new();
    //xlsx.utils.book_append_sheet(workbook, worksheet, `Cartas - 74`);
    //xlsx.writeFile(workbook, `Cartas.xlsx`);
    //console.log("Arquivo criado com sucesso")
    console.log(lista)
    console.timeEnd("Tempo-de-Execução-Total");
    await browser.close();

})();