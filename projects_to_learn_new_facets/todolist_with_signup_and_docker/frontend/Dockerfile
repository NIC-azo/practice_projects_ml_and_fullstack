# imagen base que contiene el so + servidor y distribuidor
FROM node:24-bookworm
# directorio de trabajo dentro de la imagen/contenedor
WORKDIR /app
# comando para instalar pnpm
RUN npm install -g pnpm@10.26.1
# copiar elementos claves para instalacion de dependencias
COPY package.json pnpm-lock.yaml ./
# instala las dependencias dentro de la imagen
RUN pnpm install --frozen-lockfile
# copiar el codigo "." restante dentro de la imagen "."
COPY . .
# documentar al docker compose que la aplicacion escucha en el puerto 5173
EXPOSE 5173
# comandos que se ejecutaran al iniciar al contenedor
CMD [ "pnpm", "dev", "--host", "0.0.0.0" ]

# todo se ejecuta desde arriba hasta abajo