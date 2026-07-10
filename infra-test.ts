import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute, customRefreshPage } from "./config/customDefinitions.config";
import { createLogger } from "./config/loggers.config";
import { prefixoArquivo } from "./utils";
import playwright from 'playwright';

const logger = createLogger({
    filenameCombine: `infra-test`,
    filenamePassed: `infra-test-passed`,
    filenameFailed: `infra-test-failed`
});

let emExecucao = true;

(async () => {
    let browser: playwright.Browser | undefined;
    let context: playwright.BrowserContext | undefined;
    let page: playwright.Page | undefined;
    let refreshCounter: number = 0;

    async function encerrarGraciosamente(sinal: string) {
        if (!emExecucao) return;
        emExecucao = false;

        logger.info(`\n[${sinal}] Interrompendo loop e fechando navegador... 🛑`);

        try {
            if (browser) {
                await browser.close();
            }
        } catch (err) {
            logger.log('failed', `Erro ao fechar o navegador: ${err}`);
        } finally {
            logger.log('info', `Processo encerrado com sucesso. 👋`);
            process.exit(0);
        }
    }

    process.on('SIGINT', () => encerrarGraciosamente('SIGINT'));
    process.on('SIGTERM', () => encerrarGraciosamente('SIGTERM'));

    try {
        browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch });
        context = await browser.newContext();
        page = await context!.newPage();
        await customOptimizationPageRoute(page);

        while (emExecucao) {
            try {

                if (refreshCounter % 100 == 0) {
                    try {
                        page = await customRefreshPage(context, page);
                        logger.log('passed', 'Success Page refresh 🧹✅');
                        refreshCounter++;

                    } catch (error) {
                        logger.log('failed','Failed Page refresh 🧹❌');
                        await encerrarGraciosamente('FIM_EXECUCAO');
                    }
                }

                await page.goto('https://example.com/', { waitUntil: 'load' });

                if (emExecucao) {
                    logger.log('passed', `200  🌐✅`);
                }
            } catch (error: any) {
                if (!emExecucao) break;
                logger.log('failed', `400  🌐❌ - Erro: ${error.message}`);
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } catch (error) {
        console.log(error)
        logger.log('failed', `500  💻❌`);
    } finally {
        await encerrarGraciosamente('FIM_EXECUCAO');
    }
})();
