import playwright from 'playwright';
import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute } from './config/customDefinitions.config';
import { Calendario } from './lib/definitions';
import { criarNovaBaseDados } from './lib/functions';
import { outputPathAssuntosProblemas } from './utils/databaseAssuntosPoblemas.config';

(async () => {

    const json = [];
    console.time('Tempo-de-Execução-Total');

    const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch });
    const context = await customContext(browser);
    let page = await context.newPage();
    await customOptimizationPageRoute(page);

    await page.goto('https://proconsumidor.mj.gov.br/#/atendimento', { waitUntil: 'networkidle' });
    const selectAssunto = page.locator(`label:has-text("Assunto") + select`);
    const optionsOfSelectAssunto = await selectAssunto.getByRole('option').all();

    for (const option of optionsOfSelectAssunto) {

        const optInfo = {
            assunto: await option.textContent(),
            value: await option.getAttribute('value')
        };

        if (optInfo.assunto != 'Selecione') {
            await selectAssunto.selectOption(optInfo.value);
            await page.waitForSelector('.loader-container', { state: 'hidden' });

            const selectProblema = page.locator(`label:has-text("Problema") + select`);
            const categoriesOfSelectProblema = await selectProblema.locator('optgroup').evaluateAll(
                (categories) => categories.map((category) => category.getAttribute('label'))
            );

            for (const category of categoriesOfSelectProblema) {
                const problemOfCategory = await selectProblema.locator(`optgroup[label="${category}"] > option`).allTextContents();
                for (const problem of problemOfCategory) {
                    const struct = {
                        Assunto: optInfo.assunto,
                        Categoria: category,
                        Problema: problem,
                    };
                    json.push(struct);
                }
            }
        }
    }

    const prefixFileName = new Calendario().prefixoArquivoDataAtual();
    criarNovaBaseDados({
        dadosJson: json,
        nomeArquivo: `${prefixFileName}AssuntosProblemas-Web-Scraping.xlsx`,
        nomeAba: 'Assuntos e Problemas',
        outputPath:outputPathAssuntosProblemas
    });

    console.timeEnd("Tempo-de-Execução-Total");
    await browser.close();

})();