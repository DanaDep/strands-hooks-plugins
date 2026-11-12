CREATE TABLE customers (
  id            SERIAL PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  date_of_birth DATE,
  street        TEXT,
  postal_code   TEXT,
  city          TEXT,
  country       TEXT NOT NULL,
  created_at    DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE products (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  price    NUMERIC(10,2) NOT NULL
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  product_id  INT NOT NULL REFERENCES products(id),
  quantity    INT NOT NULL,
  ordered_at  DATE NOT NULL
);

INSERT INTO customers
  (first_name, last_name, email, phone, date_of_birth, street, postal_code, city, country, created_at)
VALUES
  ('Ola',   'Nordmann', 'ola@example.no',   '+47 912 34 567',   '1985-04-12', 'Karl Johans gate 1', '0154',  'Oslo',       'Norway',  '2025-01-10'),
  ('Kari',  'Hansen',   'kari@example.no',  '+47 987 65 432',   '1990-09-23', 'Bryggen 5',          '5003',  'Bergen',     'Norway',  '2025-03-02'),
  ('Anna',  'Svensson', 'anna@example.se',  '+46 70 123 45 67', '1978-01-30', 'Drottninggatan 10',  '111 51', 'Stockholm', 'Sweden',  '2025-04-18'),
  ('Mikko', 'Virtanen', 'mikko@example.fi', '+358 40 123 4567', '1995-12-05', 'Mannerheimintie 3',  '00100', 'Helsinki',   'Finland', '2025-06-25'),
  ('Lars',  'Jensen',   'lars@example.dk',  '+45 20 12 34 56',  '1982-07-17', 'Strøget 8',          '1160',  'Copenhagen', 'Denmark', '2025-08-09');

INSERT INTO products (name, price) VALUES
  ('Coffee mug', 129.00),
  ('Notebook',    79.50),
  ('Desk lamp',  499.00),
  ('Headphones', 899.00);

INSERT INTO orders (customer_id, product_id, quantity, ordered_at)
SELECT (g % 5) + 1, (g % 4) + 1, 1 + (g % 4) + (g % 3), DATE '2026-01-01' + g
FROM generate_series(1, 60) AS g;
