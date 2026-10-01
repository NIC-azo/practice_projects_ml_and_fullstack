# imagen base que contiene el so + servidor y distribuidor 
FROM node:24-bookworm
# directorio de trabajo dentro de la imagen/contenedor
WORKDIR /app
# comando para instalar pnpm
RUN npm install -g pnpm@10.26.1
# copiar los elementos necesarios para el /app
COPY package.json pnpm-lock.yaml ./
# instalar las dependencias dentro de la imagen
RUN pnpm install --frozen-lockfile
# copiar el codigo "." restante dentro de la imagen "."
COPY . .
# generar el cliente de Prisma dentro del entorno
RUN pnpm prisma generate
# documentar al docker compose que la aplicacion escucha en puerto 4000
EXPOSE 4000
# comandos que se ejecutaran al iniciar al contenedor
CMD [ "pnpm", "dev" ]

# todo se ejecuta desde arriba hasta abajo