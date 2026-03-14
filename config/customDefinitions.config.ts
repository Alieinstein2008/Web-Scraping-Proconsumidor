import playwright from 'playwright';

export async function customContext(browser: playwright.Browser) {
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json',
        timezoneId: 'America/Sao_Paulo',
        locale: 'pt-BR'
    });
    return context;
};

export const customOptimizationBrowserArgsLaunch = [
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--disable-extensions',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--ignore-certificate-errors'
];



