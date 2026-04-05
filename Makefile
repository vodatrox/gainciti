.PHONY: up down build migrate seed logs shell createsuperuser test lint

# Docker commands
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

# Backend commands (run inside container)
migrate:
	docker compose exec backend python manage.py migrate

makemigrations:
	docker compose exec backend python manage.py makemigrations

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

seed:
	docker compose exec backend python manage.py seed

shell:
	docker compose exec backend python manage.py shell

# Development (local)
dev-backend:
	cd backend && python manage.py runserver

dev-blog:
	cd blog && npm run dev

dev-admin:
	cd admin-backoffice && npm run dev

# Testing
test-backend:
	cd backend && pytest

lint-backend:
	cd backend && ruff check .

lint-blog:
	cd blog && npm run lint

lint-admin:
	cd admin-backoffice && npm run lint
