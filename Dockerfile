FROM node:20-alpine AS build

WORKDIR /app

# Copia os arquivos de dependência primeiro
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o restante dos arquivos do projeto
COPY . .

# Faz o build do projeto para produção
RUN npm run build

# Etapa 2: Servidor Nginx para os arquivos estáticos
FROM nginx:alpine

# Remove as configurações padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copia nossa configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos da build para a pasta que o Nginx vai servir
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
