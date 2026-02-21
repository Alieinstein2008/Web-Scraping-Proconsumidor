import playwright from 'playwright';

export async function customContext(browser: playwright.Browser) {
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json',
        timezoneId: 'America/Sao_Paulo',
        locale: 'pt-BR'
    });
    return context;
}