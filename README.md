# 🕸️ Web Scraping - ProConsumidor

> Ferramenta de **web scraping automatizado** desenvolvida com **TypeScript e Playwright** para coleta de dados públicos do sistema **ProConsumidor**, permitindo a extração e organização de informações de forma programática.

![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue?logo=typescript)
![Playwright](https://img.shields.io/badge/Playwright-Web%20Automation-green?logo=playwright)
![Node.js](https://img.shields.io/badge/Node.js-runtime-brightgreen?logo=node.js)
![Status](https://img.shields.io/badge/status-active-success)

---

# 📌 Sobre o Projeto

Este projeto implementa um **script de automação e web scraping utilizando Playwright**, desenvolvido em **TypeScript**, responsável por coletar informações públicas disponíveis no sistema **ProConsumidor**.

A aplicação automatiza a navegação em páginas web, interage com elementos da interface e extrai dados relevantes, transformando informações não estruturadas em **dados organizados que podem ser utilizados para análise ou monitoramento**.

O projeto demonstra habilidades importantes em:

- Automação de navegação web
- Web scraping moderno
- Manipulação de DOM
- Estruturação de dados
- Desenvolvimento com TypeScript

---

# 🚀 Funcionalidades

- 🔎 Navegação automatizada utilizando **Playwright**
- 🖱️ Interação programática com elementos da página
- 📄 Extração de dados diretamente do DOM
- ⚙️ Script automatizado para coleta de informações
- 🧩 Código estruturado e escalável

---

# 🧠 Motivação

Sistemas públicos frequentemente disponibilizam dados importantes, porém muitas vezes **não possuem APIs abertas ou formatos estruturados para análise**.

Este projeto demonstra como utilizar **automação de navegador com Playwright** para coletar essas informações de maneira eficiente, permitindo que os dados sejam posteriormente utilizados em:

- Análises de dados
- Dashboards
- Estudos acadêmicos
- Monitoramento de serviços

Além disso, o projeto serve como **exemplo prático de automação web moderna utilizando TypeScript**.

---

## 🧠 Decisões Técnicas

### Por que Playwright?

O Playwright foi escolhido porque:

- suporta múltiplos navegadores
- lida bem com páginas renderizadas com JavaScript
- possui API moderna e robusta para automação

### Por que TypeScript?

TypeScript foi utilizado para:

- maior segurança de tipos
- melhor manutenção do código
- melhor experiência de desenvolvimento

---

# 🛠️ Tecnologias Utilizadas

| Tecnologia | Função |
|---|---|
| **TypeScript** | Linguagem principal do projeto |
| **Node.js** | Ambiente de execução |
| **Playwright** | Automação de navegador e scraping |
| **TSX** | Execução de scripts TypeScript |

---

# 📂 Estrutura do Projeto

```
Web-Scraping-Proconsumidor
│
├── config/
    ├── auth.setup.ts
    ├── customDefinitions.config.ts
    ├── fecthApi.config.ts
    ├── filePath.config.ts
    ├── loggers.config.ts
├── data/
    ├── in/(Localização dos arquivos xlsx de entrada)
    ├── out/(Localização dos arquivos xlsx de saída)
├── lib/
    ├── definitions.tsx
    ├── functions.tsx
├── types/
    ├── carta.types.ts
    ├── consumidor.types.ts
    ├── index.ts
    ├── numeroAtendimento.types.ts
    ├── user.config.types.ts
├── logs/
    ├── ***-passed.log
    ├── ***failed.log
    ├── ***-blank.log
    ├── ***combine.log
├── utils/
    ├── databaseCartas.config.tsx
    ├── databaseCartas.quickAcessFunctions.tsx
    ├── databaseConsumidor.config.tsx
    ├── databaseConsumidor.quickAcessFunctions.tsx
    ├── databaseAssuntosProblemas.config.tsx
│
├── scraper-TratativaCarta.tsx
├── scraper-Consumidor.tsx
├── scraper-AssuntosProblemas.tsx
├── package.json
├── tsconfig.json
└── README.md
```

---

# ⚙️ Instalação

Clone o repositório:

```bash
git clone https://github.com/Alieinstein2008/Web-Scraping-Proconsumidor.git
```

Entre na pasta do projeto:

```bash
cd Web-Scraping-Proconsumidor
```

Instale as dependências:

```bash
npm install
```

Instale os navegadores do Playwright:

```bash
npx playwright install
```

---

# ▶️ Como Executar

Execute o script de scraping:

```bash
npx tsx scraper-***.tsx
```

O script irá:

1. Abrir um navegador automatizado
2. Navegar pelas páginas do sistema
3. Interagir com os elementos necessários
4. Extrair os dados relevantes
5. Tratar os dados obtidos e gerar um arquivo .xlsx de sáida 

---

# 📊 Possíveis Aplicações

Os dados coletados podem ser utilizados para:

- 📈 Análise de reclamações de consumidores
- 📊 Criação de dashboards de monitoramento
- 🔎 Estudos sobre relações de consumo
- 🧠 Projetos de ciência de dados
- 🧭 Otimização de tarefas repetitivas 
---

# 🔮 Melhorias Futuras

Possíveis evoluções do projeto:

- Integração com banco de dados (PostgreSQL / MongoDB)
- Criação de API para acesso aos dados coletados
- Automação de coleta periódica
- Sistema de logs e monitoramento
- Dashboard para visualização dos dados
- Interface gráfica do projeto 

---

# ⚠️ Aviso

Este projeto foi desenvolvido **para fins educacionais e de estudo**.

Ao utilizar técnicas de automação e scraping:

- Respeite os termos de uso dos sites
- Evite sobrecarregar servidores
- Utilize os dados de forma ética e responsável

---

# 👨‍💻 Autor

**Arthur Alonso**

GitHub:  
https://github.com/Alieinstein2008

LinkedIn:  
https://www.linkedin.com/in/arthuralonsomarcelino/

---

# ⭐ Apoie o Projeto

Se este projeto foi útil para você:

⭐ Deixe uma estrela no repositório  
🍴 Faça um fork do projeto  
📢 Compartilhe com outras pessoas
