INSERT INTO "role" (name) VALUES ('USER'), ('ADMIN');

INSERT INTO "user" (first_name, last_name, email, phone, password, role_id) VALUES 
('John', 'Doe', 'john.doe@example.com', '1234567890', '$2a$10$EIXZ1F1e1Z1F1e1Z1F1e1e', 1), 
('Jane', 'Smith', 'jane.smith@example.com', '0987654321', '$2a$10$EIXZ1F1e1Z1F1e1Z1F1e1e', 2);

INSERT INTO "restaurant_table" (table_number, capacity, location, shape) VALUES 
(1, 4, 'window', 'rectangle'), 
(2, 2, 'center', 'circle'), 
(3, 6, 'patio', 'rectangle'), 
(4, 8, 'bar', 'square');

INSERT INTO "staff" (full_name, email, phone, role) VALUES 
('Alice Johnson', 'alice.johnson@example.com', '1112223333', 'waiter'), 
('Bob Brown', 'bob.brown@example.com', '4445556666', 'manager');

INSERT INTO "contact_message" (first_name, last_name, email, message) VALUES 
('Tom', 'Hanks', 'tom.hanks@example.com', 'Hello, I would like to make a reservation.');