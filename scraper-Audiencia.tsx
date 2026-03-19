type EstruturaAudiencia = {
    Fornecedor?: string;
    Cnpj?: string;
    Data?: string;
    Situacao?: string;
    NumeroAtendimento?: string;
    Redesignacao?:string;
    Resultado?: string;
    Scraping?: string;
}
class tratativaAudiencia {
    private fornecedor:string;
    private cnpj:string;
    private data:string;
    private situacao: string;
    private numeroAtendimento: string;
    private redesignacao: string;
    private resultado: string;
    private scraping: string;

    constructor(scraping: 'failed' | 'passed' | 'blank', resultado: string, numeroAtendimento: string, situacao: string, data: string, fornecedor: string, redesignacao: string, cnpj:string){
       this.fornecedor = fornecedor;
       this.cnpj = cnpj;
       this.data = data;
       this.situacao = situacao;
       this.numeroAtendimento = numeroAtendimento;
       this.redesignacao = redesignacao;
       this.resultado = resultado;
       this.scraping = scraping;
    }
    public retornaEstrutura(tipo: number): EstruturaAudiencia {
            switch (tipo) {
                default:
                    const estrutura: EstruturaAudiencia = {
                        NumeroAtendimento: this.numeroAtendimento,
                        Fornecedor: this.fornecedor,
                        Cnpj: this.cnpj,
                        Data: this.data,
                        Resultado: this.resultado,
                        Redesignacao: this.redesignacao,
                        Situacao: this.situacao,
                        Scraping: this.scraping
                    }
                    return estrutura;
            }
    }

}

