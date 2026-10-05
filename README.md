# Solve Odontologia Avançada

Site institucional da Solve, em Araxá (MG), com vídeo, fotos e identidade visual fornecidos pela clínica.

## Visualização local

Abra um terminal nesta pasta e execute:

```sh
python3 -m http.server 8000
```

Acesse [http://localhost:8000](http://localhost:8000). O site é estático: não há instalação de dependências nem etapa de compilação.

## Enviar ao GitHub

Crie um repositório e adicione **o conteúdo desta pasta** à raiz do repositório. O arquivo `index.html` precisa permanecer na raiz. Para publicar pelo GitHub Pages, abra **Settings → Pages → Build and deployment**, selecione **Deploy from a branch**, escolha a branch principal e a pasta **/(root)**. [Instruções oficiais do GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

**Atenção:** um site publicado no GitHub Pages fica acessível publicamente, mesmo quando o plano permite publicar a partir de um repositório privado. Confirme com a clínica antes de tornar as fotos e o vídeo públicos nessa plataforma.

## Estrutura

- `index.html`: conteúdo e marcação.
- `styles.css`: identidade visual e responsividade.
- `app.js`: animações e interações.
- `assets/`: imagens, vídeo e fontes locais, com licenças das fontes incluídas.
- `vendor/`: bibliotecas GSAP usadas nas animações.
- `preview/`: capturas para apresentação.

O site usa os contatos informados no briefing. O botão de ligação inicia uma chamada no dispositivo do visitante; Instagram e mapa abrem serviços externos.
