SHELL := /bin/bash

.PHONY: setup dev build start prisma-generate prisma-push db-reset docker-up docker-down deploy logs

setup:
	npm install
	npx prisma generate
	npx prisma db push

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

prisma-generate:
	npx prisma generate

prisma-push:
	npx prisma db push

db-reset:
	npx prisma migrate reset --force

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

deploy:
	docker compose pull || true
	docker compose up -d --build

logs:
	docker compose logs -f --tail=200 web
