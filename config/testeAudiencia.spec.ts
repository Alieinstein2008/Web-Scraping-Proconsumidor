import { test, expect } from "@playwright/test";
import playwright from "playwright";
import {customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage, customTimeout} from "./customDefinitions.config";
import { NumeroAtendimento } from "../lib/definitions";
test("test", async ({ page }) => {
  console.time("Tempo-de-Execução-Total");

  const browser = await playwright.chromium.launch({args: customOptimizationBrowserArgsLaunch,});

  const context = await customContext(browser);
  const regexSituacao = new RegExp(`(Finalizada|Cancelada|Aberta)`, 'i');
  await page.goto("https://proconsumidor.mj.gov.br/#/inicio", {waitUntil: "networkidle", timeout: customTimeout.general});

  //const itensBusca = "22.12.0532.001.00701-3";
  //for (const NA of itensBusca) {
    const numeroAtendimento = new NumeroAtendimento("22.12.0532.001.00701-3");
    try {
      await page.getByPlaceholder("Nº de Atendimento").fill(numeroAtendimento.Formatacao(1));
      await page.getByTitle("Pesquisar").first().click({ timeout: 30000 });
      await page.waitForURL(`https://proconsumidor.mj.gov.br/#/reclamacao/pesquisa/${numeroAtendimento.Formatacao(2)}`,{ timeout: customTimeout.general});
      await page.waitForSelector(".loader-container", { state: "hidden" });

      const data= await page.locator('app-tratativa h5').first().textContent();
      const situacaoAudiencia = await page.locator('app-tratativa p').first().filter({ hasText: regexSituacao }).textContent() ?? '';
      
     
      
    } catch {}
  //}
});
