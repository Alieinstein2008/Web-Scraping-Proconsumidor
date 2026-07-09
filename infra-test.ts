import { customContext, customOptimizationBrowserArgsLaunch, customOptimizationPageRoute } from "./config/customDefinitions.config";
import { createLogger } from "./config/loggers.config";
import { prefixoArquivo } from "./utils";
import playwright from 'playwright';

const logger = createLogger({
    filenameCombine: `${prefixoArquivo}infra-test`,
    filenamePassed: `${prefixoArquivo}infra-test-passed`,
    filenameFailed: `${prefixoArquivo}infra-test-failed`
});

let emExecucao = true;

(async () => {
    let browser: playwright.Browser | undefined;
    let context: playwright.BrowserContext | undefined;
    let page: playwright.Page | undefined;

    async function encerrarGraciosamente(sinal: string) {
        if (!emExecucao) return; 
        emExecucao = false;
        
        logger.log('info', `\n[${sinal}] Interrompendo loop e fechando navegador... 🛑`);
        
        try {
            if (browser) {
                await browser.close();
            }
        } catch (err) {
            logger.log('failed', `Erro ao fechar o navegador: ${err}`);
        } finally {
            logger.log('info', `Processo encerrado com sucesso. 👋`);
            process.exit(0); // Força o encerramento do Node.js
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
