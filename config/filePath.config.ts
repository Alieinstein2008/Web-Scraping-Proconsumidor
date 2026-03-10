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

export function setDefaultFilesPath({
    directoryInputRelativePath,
    directoryOutputRelativePath,
    inputFilenames
}: {
    directoryInputRelativePath: string,
    directoryOutputRelativePath: string,
    inputFilenames: string[]
}): { sucess: true; directoryInputPath: string; directoryOutputPath: string; filesPath: string[] } | { sucess: false; error: CreateError } {

    const callPath = callerPath();

    const inputFilesPath: string[] = [];

    const directoryInputPath = callPath !== undefined ? path.join(path.dirname(callPath), directoryInputRelativePath) : path.join(__dirname, directoryInputRelativePath);
    const directoryOutputPath = callPath !== undefined ? path.join(path.dirname(callPath), directoryOutputRelativePath) : path.join(__dirname, directoryOutputRelativePath);

    const responseCreateDirectories = createDirectories({ directoriesRelativePath: [directoryInputPath, directoryOutputPath] });

    if (responseCreateDirectories.sucess) {

        for (const inputFilename of inputFilenames) {

            const inputFilePath = path.resolve(directoryInputPath, inputFilename);

            if (!fs.existsSync(inputFilePath)) {

                inputFilesPath.push(inputFilePath);
                const dadosNulosJson = [{}];
                const worksheet = xlsx.utils.json_to_sheet(dadosNulosJson);
                const workbook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(workbook, worksheet);
                xlsx.writeFile(workbook, inputFilePath);

            };
        };

        return {
            sucess: true,
            directoryInputPath: directoryInputPath,
            directoryOutputPath: directoryOutputPath,
            filesPath: inputFilesPath
        };

    } else {
        return {
            sucess: false,
            error: {
                type: 'createFileError',
                message: responseCreateDirectories.error.message
            }
        }
    }
};
