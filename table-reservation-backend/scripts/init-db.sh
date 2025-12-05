#!/bin/bash

# This script initializes the PostgreSQL database for the table reservation system.

# Set database connection variables
DB_NAME="table_reservation"
DB_USER="your_db_user"
DB_PASSWORD="your_db_password"
DB_HOST="localhost"
DB_PORT="5432"

# Create the database
echo "Creating database..."
psql -h $DB_HOST -U $DB_USER -p $DB_PORT -c "CREATE DATABASE $DB_NAME;"

# Run the initialization SQL script
echo "Initializing database schema..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f ../src/main/resources/db/migration/V1__init.sql

# Seed initial data if needed
# Uncomment the following line if you have a seed data script
# psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f ../scripts/seed-data.sql

echo "Database initialization complete."