import { test as setup, expect } from '@playwright/test';
import { UserInformation } from '../lib/definitions';
import dotenv from 'dotenv';
dotenv.config();

const user: UserInformation = {
    credential: process.env.CRENDENTIAL ?? '',
    password: process.env.PASSWORD ?? ''
}
const authFile = '/project/workspace/playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {

    await page.goto('https://proconsumidor.mj.gov.br/#/login', { waitUntil: 'load' });
    await page.getByLabel('CPF').fill(user.credential);
    await page.getByLabel('Senha').fill(user.password);
    await page.getByRole('button').filter({hasText:'Entrar'}).click();
    await page.waitForURL('https://proconsumidor.mj.gov.br/#/inicio');
    await page.context().storageState({ path: authFile });    
});