FROM nginx:alpine

# Copy custom Nginx configuration with reverse proxy for backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend static files
COPY . /usr/share/nginx/html

# Expose Nginx default HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
