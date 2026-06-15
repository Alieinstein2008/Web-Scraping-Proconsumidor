import playwright from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

export async function customContext(browser: playwright.Browser): Promise<playwright.BrowserContext> {
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

export async function customOptimizationPageRoute(page: playwright.Page): Promise<void> {
    page.route("**/*", (route) => {
        const type = route.request().resourceType()

        if (["image", "font", "media"].includes(type)) {
            route.abort()
        } else {
            route.continue()
        }
    });
};

export async function customRefreshPage(context: playwright.BrowserContext, page: playwright.Page): Promise<playwright.Page> {
    page.close();
    return context.newPage();
};


export const TIMEOUTS = {
    NAVIGATION: 30000,
    LOADING: 20000,
    CLICK: 10000,
    ELEMENT: 7500,
} as const;


