// @ts-check
import playwright from 'playwright';
import xlsx from "xlsx";


(async () => {

    const browser = await playwright.chromium.launch();
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json',
        timezoneId: 'America/Sao_Paulo',
        locale: 'pt-BR'
    });
    const page = await context.newPage();

    const lista = [];
    await page.goto('https://proconsumidor.mj.gov.br/#/atendimento', { waitUntil: 'networkidle' });

    const assuntoLocator = page.locator(`label:has-text("Assunto") + select`);
    const optionsAssunto = await assuntoLocator.getByRole('option').allTextContents();
    for (const assunto of optionsAssunto) {
        if (assunto == 'Produtos para Uso Industrial ') {
            await assuntoLocator.selectOption(assunto); 
            await page.waitForSelector('.loader-container', { state: 'hidden' });
            const problemaLocator = page.locator(`label:has-text("Problema") + select`);
            const optionsProblema = await problemaLocator.getByRole('option').all();
            console.log(optionsProblema);
            /*
            for (const label of all) {
                const optionsOfLabel = await label.getByRole('option').all();

                for (const option of optionsOfLabel) {
                    const obj = {
                        assunto: assunto,
                        categoria: await label.getAttribute('label'),
                        problema: await option.textContent()

                    };
                    //console.log(obj);
                    list.push(obj);
                }

            }**/
        }

    };
    /**
      const date = Date();
    const worksheet = xlsx.utils.json_to_sheet(list);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, `Assuntos e Problemas Proconsumidor`);
    xlsx.writeFile(workbook, `Assuntos_Problemas-${date}.xlsx`);
    console.log("Arquivo criado com sucesso")

     */


    await browser.close();

})();