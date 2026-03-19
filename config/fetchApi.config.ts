export async function coordenadasCep(cep: string): Promise<any[]> {
    try {
        cep = cep.replace(/-/g, '');
        const response = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        return [result['lat'], result['lng']];
    }
    catch (error) {
        console.error(error);
    }
    return ['', ''];
}