![Imersão Full Stack && Full Cycle](https://events-fullcycle.s3.amazonaws.com/events-fullcycle/static/site/img/grupo_4417.png)

Participe gratuitamente: https://imersao.fullcycle.com.br/

## Sobre o repositório
Esse repositório contém o código-fonte ministrado na aula Criando aplicação React com Material UI, Websockets e Mapas: [https://www.youtube.com/watch?v=Ibb-7R7oiLo](https://www.youtube.com/watch?v=Ibb-7R7oiLo)

## Rodar a aplicação

Existem duas aplicações 

* O back-end em Nest.js que vai servir a lista de rota e o servidor de websocket que notificar os pontos do trajeto
* O front-end em React.js que vai mostrar o Mapa e o rastreamento de veículos

Para funcionar você precisar levantar as duas aplicações, além de gerar uma Chave de API do Google Maps e colocar no `App.tsx`.

Execute os comandos:

```bash
cd nestjs
npm install
npm run start:dev

cd reactjs-maps
npm install
npm start
```

Acesse http://localhost:3000 para visualizar o mapa.
