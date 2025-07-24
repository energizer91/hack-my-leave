FROM nginx:alpine

# Устанавливаем дополнительные инструменты
RUN apk add --no-cache curl

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Создаем директории для логов
RUN mkdir -p /var/log/nginx

EXPOSE 3050

CMD ["nginx", "-g", "daemon off;"]