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

    const json = [];

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

    const currentDate = new Date();
    const formatedDate = currentDate.toLocaleDateString('pt-br').replace(/\//g, '_');
    const worksheet = xlsx.utils.json_to_sheet(json);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, `${formatedDate}`);
    xlsx.writeFile(workbook, `Assuntos_Problemas_${formatedDate}.xlsx`);
    console.log("Arquivo criado com sucesso")

    await browser.close();

})();