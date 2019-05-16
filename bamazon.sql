DROP DATABASE IF EXISTS bamazonDB;
CREATE database bamazonDB;

USE bamazonDB;

CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT,
	product_name VARCHAR(100) NULL,
	department_name VARCHAR(100) NULL,
	price DOUBLE NULL,
	stock_quantity INTEGER Null,
    product_sales INTEGER,
	PRIMARY KEY (item_id)
);

