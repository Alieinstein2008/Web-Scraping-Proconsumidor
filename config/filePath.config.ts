import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';

interface CreateError {
    type: 'createDirectoryError' | 'createFileError',
    message: string
}

export async function createDirectories({ directoriesRelativePath }: { directoriesRelativePath: string[] }): Promise<{ sucess: true; } | { sucess: false; error: CreateError; }> {
    let coutErrors = 0;
    for (const directoryRelativePath of directoriesRelativePath) {
        try {
            fs.mkdir(directoryRelativePath, { recursive: true }, (err) => {
                if (err) throw err;
            });
        } catch (err) {
            coutErrors++;
        }
    };

    if (coutErrors > 0) return {
        sucess: false,
        error: { type: 'createDirectoryError', message: `Falha um ou mais diretórios` }
    };
    return { sucess: true };

};

export async function setDefaultFilesPath({ directoryInputRelativePath, directoryOutputRelativePath, filenamesInput }: { directoryInputRelativePath: string, directoryOutputRelativePath: string, filenamesInput: string[] }) {

    const inputPath = path.join(__dirname, directoryInputRelativePath);
    const outputPath = path.join(__dirname, directoryOutputRelativePath);
    const createResponse = await createDirectories({ directoriesRelativePath: [inputPath, outputPath] });
    if (createResponse.sucess) {
        for (const filenameInput of filenamesInput) {
            const fileInputPath = path.join(inputPath, filenameInput);
            if (!fs.existsSync(fileInputPath)) {
                const dadosNulosJson = [{}];
                const worksheet = xlsx.utils.json_to_sheet(dadosNulosJson);
                const workbook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(workbook, worksheet);
                xlsx.writeFile(workbook, fileInputPath);
                console.log(`${filenameInput} criado com sucesso📄`)
            }else{
                console.log(`${filenameInput} já existente📄`)
            }
        }
    }
};
