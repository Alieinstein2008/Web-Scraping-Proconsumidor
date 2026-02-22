import fs from 'fs';

export async function createDirectoriesInRoot({ dirnameInput, dirnameOutput }: { dirnameInput: string, dirnameOutput: string }): Promise<void> {
    try {
        fs.mkdir(`./${dirnameInput}`, { recursive: true }, (err) => {
            if (err) throw err;
        });
        fs.mkdir(`./${dirnameOutput}`, { recursive: true }, (err) => {
            if (err) throw err;
        });
    } catch (err) {
        console.error(`Error : Falha ao criar os diretórios`, err);
    }
};
