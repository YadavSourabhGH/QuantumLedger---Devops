# ====================================================
# Project QuantumLedger - Dashboard Production Dockerfile
# ====================================================

# Step 1: Base Alpine Nginx Image
FROM nginx:alpine

# Step 2: Remove default nginx configuration and static pages
RUN rm -rf /usr/share/nginx/html/* && \
    rm -f /etc/nginx/conf.d/default.conf

# Step 3: Copy Dashboard Files to Nginx web root directory
COPY ./index.html /usr/share/nginx/html/index.html
COPY ./app.css /usr/share/nginx/html/app.css
COPY ./app.js /usr/share/nginx/html/app.js

# Step 4: Add security hardened nginx configuration
COPY ./docker/nginx.conf /etc/nginx/conf.d/cbdc-ops.conf

# Step 5: Expose web service port
EXPOSE 80

# Step 6: Start Web Server
CMD ["nginx", "-g", "daemon off;"]
