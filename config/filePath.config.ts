import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import callerPath from 'caller-path';

interface CreateError {
    type: 'createDirectoryError' | 'createFileError',
    message: string
};

export function createDirectories({ directoriesRelativePath }: { directoriesRelativePath: string[] }): { sucess: true; } | { sucess: false; error: CreateError; } {

    let errorsCount = 0;
    for (const directoryRelativePath of directoriesRelativePath) {
        try {
            fs.mkdirSync(directoryRelativePath, { recursive: true });
        } catch (err) {
            errorsCount++;
        }
    };

    if (errorsCount > 0) return {
        sucess: false,
        error: { type: 'createDirectoryError', message: `Falha na criação de um ou mais diretórios` }
    };
    return { sucess: true };

};

export function setDefaultFilesPath(
    { directoryInputRelativePath, directoryOutputRelativePath, filenamesInput }: { directoryInputRelativePath: string, directoryOutputRelativePath: string, filenamesInput: string[] }): string[] {

    const callPath = callerPath();

    const inputPath = callPath !== undefined ? path.join(path.dirname(callPath), directoryInputRelativePath) : path.join(__dirname, directoryInputRelativePath);
    const outputPath = callPath !== undefined ? path.join(path.dirname(callPath), directoryOutputRelativePath) : path.join(__dirname, directoryOutputRelativePath);

    const response = createDirectories({ directoriesRelativePath: [inputPath, outputPath] });

    if (response.sucess) {

        for (const filenameInput of filenamesInput) {

            const fileInputPath = path.resolve(inputPath, filenameInput);

            if (!fs.existsSync(fileInputPath)) {

                const dadosNulosJson = [{}];
                const worksheet = xlsx.utils.json_to_sheet(dadosNulosJson);
                const workbook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(workbook, worksheet);
                xlsx.writeFile(workbook, fileInputPath);
                console.log(`${fileInputPath} gerado com sucesso📄✅`);

            } else {
                console.log(`${filenameInput} já existente📄✅`);
            };
        };

        return [inputPath, outputPath];

    } else {
        console.log(response.error.message);
        return ['', '']
    }
};
