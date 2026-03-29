import { test as setup } from '@playwright/test';
import { UserInformation } from '../types/user.config.types';
import dotenv from 'dotenv';
dotenv.config();

const user: UserInformation = {
    credential: process.env.CREDENTIAL ?? " ", //Um caractere vazio IMPORTANTTE
    password: process.env.PASSWORD ?? " "
}
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    try {
        await page.goto('https://proconsumidor.mj.gov.br/#/login', { waitUntil: 'networkidle' });
        try {
            await page.getByLabel('CPF').fill(user.credential);
            await page.getByLabel('Senha').fill(user.password);
            await page.getByRole('button').filter({ hasText: 'Entrar' }).click();
            if (await page.getByRole("button", { name: 'close' }).isVisible()) {
                throw new Error('\n🛑 ERROR 🛑 : CPF ou Senha Invalidos, verifique o arquivo .env e tente novamente. 🛑 🛑\n');
            } else {
                await page.waitForSelector('.loader-container', { state: 'hidden' });
                await page.waitForURL('https://proconsumidor.mj.gov.br/#/inicio', { timeout: 6000 });
                await page.context().storageState({ path: authFile });
                console.log("\n✅ Autenticação realizada com sucesso!\n");
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error('\n🛑 ERROR 🛑 : Falha Inesperada, tente novamente. 🛑 🛑\n');
            }
        }
    } catch (error) {
        console.error('\n🛑 ERROR 🛑 : URL não existente ou indisponivel, verifique e tente novamente. 🛑 🛑\n');
    };
});