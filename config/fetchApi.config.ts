export async function coordenadasCep(cep: string): Promise<any[]> {
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token token=1c9e974960c2b4e3e730a3bc48a6f5b7'
        }
    };

    try {
        cep = cep.replace(/-/g, '');
        const response = await fetch(`https://www.cepaberto.com/api/v3/cep?cep=${cep}`, options);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        return [result['latitude'], result['longitude']];
    }
    catch (error) {
        console.error(error);
    }
    return ['', ''];
}