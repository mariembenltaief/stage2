ALTER TABLE users ADD COLUMN photo TEXT;
CREATE TABLE categories (
    name VARCHAR  NOT NULL,
    description VARCHAR(255)
);
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255) 
);
