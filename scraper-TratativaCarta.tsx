import playwright from 'playwright';
import { NumeroAtendimento, TratativaCarta, TuplaInformacoesFailedCarta, TuplaInformacoesNulasCarta, TuplaInformacoesParciaisCarta } from './lib/definitions';
import { carregarAlteracoesBaseCartas, executarBackupBaseCartas, retornaReclamacoesDivergentes, retornaReclamacoesFalhas, retornaReclamacoesUltimos4Meses, salvamentoPorInterrupcao } from './utils/database.quickAccessFunctions';
import dotenv from 'dotenv';
dotenv.config();

const textoBusca = 'Carta';
const regexBusca = new RegExp(`[0-9] - ${textoBusca}`, '');
const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');

let passed = [];
let allTested: any[] = [];
let failed = [];
var cont = 0;

(async () => {

    console.time("Tempo-de-Execução-Total");
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json',
        timezoneId: 'America/Sao_Paulo',
        locale: 'pt-BR'
    });
    const page = await context.newPage();


    const reclamacoesDivergentes = retornaReclamacoesDivergentes();
    const grupoBusca = [...reclamacoesDivergentes];
    const listaBusca = ['23.08.0532.001.00362-3',...new Set(grupoBusca)];

    //executarBackupBaseCartas();

    process.on('SIGINT', () => salvamentoPorInterrupcao('SIGINT', allTested, cont));

    for (const NA of listaBusca) {

        try {

            const inicio = performance.now();

            if (cont == 0) await page.goto('https://proconsumidor.mj.gov.br/#/inicio', { waitUntil: 'networkidle' });

            const numeroAtendimento = new NumeroAtendimento(NA);

            try {
                await page.getByPlaceholder('Nº de Atendimento').fill(numeroAtendimento.Formatacao(1));
                await page.getByTitle('Pesquisar').click();
                await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.Formatacao(2)}`, { timeout: 60000 });
                await page.waitForSelector('.loader-container', { state: 'hidden' });

                //Abre o painel suspenso de tratativas caso esteja fechado/recolhido
                const painelTratativa = page.locator('app-tratativa');
                if (!await painelTratativa.isVisible()) {
                    await page.getByTitle('Clique para Expandir/Recolher').filter({ hasText: "Tratativas" }).click();
                }

                const conjuntoCorrespondencia = await page.getByText(regexBusca).all();
                if (conjuntoCorrespondencia.length == 0) {
                    const argsBlank = Array(6).fill('') as TuplaInformacoesNulasCarta;
                    const cartaBlank = new TratativaCarta('blank', numeroAtendimento.Formatacao(1), 'Ausência de Tratativa', ...argsBlank);
                    const estruturaBlank = cartaBlank.retornaEstrutura(1);
                    allTested.push(estruturaBlank);

                } else {
                    for (const correspondencia of await page.getByText(regexBusca).all()) {

                        await correspondencia.click({ timeout: 60000 });
                        await page.waitForSelector('.loader-container', { state: 'hidden' });
                        const situacaoCarta = await page.locator('app-tratativa span').filter({ hasText: regexSituacao }).textContent() ?? '';

                        const tabelaCarta = await page.locator('app-tratativa table tbody tr:nth-child(n)').all()
                        for (const linha of tabelaCarta) {

                            const conteudoLinha: string[] = await linha.locator('> td').allInnerTexts();
                            const args = conteudoLinha as TuplaInformacoesParciaisCarta;
                            const fornecedor = page.locator('app-reclamacao-fornecedor div.row.mb-2').filter({ has: page.locator('div.col-md-3', { hasText: args[0] }) });
                            const fornecedorCodigo = (await fornecedor.locator('input').nth(1).inputValue()).slice(22, 24);
                            const fornecedorCNPJ = await fornecedor.locator('input').nth(3).inputValue();
                            const carta = new TratativaCarta('passed', numeroAtendimento.Formatacao(1), situacaoCarta, fornecedorCodigo, fornecedorCNPJ, ...args);
                            const estrutura = carta.retornaEstrutura(1);
                            passed.push(estrutura);
                            allTested.push(estrutura);

                        }
                    }
                }

                const fim = performance.now();
                const time = ((fim - inicio) / 1000).toFixed(2);
                console.log(`NA: ${numeroAtendimento.Formatacao(1)} Tempo de Execução: ${time}s  ✅  ${cont + 1}°`);

            } catch (error) {
                const fim = performance.now();
                const time = ((fim - inicio) / 1000).toFixed(2);
                const argsFailed = Array(7).fill('') as TuplaInformacoesFailedCarta;
                const cartaFailed = new TratativaCarta('failed', numeroAtendimento.Formatacao(1), ...argsFailed,);
                const estruturaFailed = cartaFailed.retornaEstrutura(1);
                console.log(`NA: ${numeroAtendimento.Formatacao(1)} Tempo de Execução: ${time}s ❌  ${cont + 1}°`);
                failed.push(estruturaFailed);
                allTested.push(estruturaFailed);
                continue;
            }
            carregarAlteracoesBaseCartas(allTested);
            console.log(`${cont + 1} alterações carregadas com sucesso 👌 `);
            cont++;

        } catch (error) {

            carregarAlteracoesBaseCartas(allTested);
            console.log('\nPlanilhas Geradas com erro! 🔺\n');
            console.timeEnd("Tempo-de-Execução-Total");
            break;

        }

    }

    carregarAlteracoesBaseCartas(allTested);
    console.log('\nPlanilhas Geradas ✅\n');
    console.timeEnd("Tempo-de-Execução-Total");
    await browser.close();

})();