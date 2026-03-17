.PHONY: setup build start stop restart logs health clean test

setup:
	cp .env.example .env

build:
	docker-compose build

start:
	docker-compose up -d

stop:
	docker-compose down

restart:
	docker-compose down && docker-compose up -d

logs:
	docker-compose logs -f

health:
	docker-compose ps

clean:
	docker-compose down -v

test:
	docker-compose exec backend npm test
	docker-compose exec frontend npm test
	docker-compose exec ml-service pytest
