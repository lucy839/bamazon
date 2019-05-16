USE bamazonDB;

CREATE TABLE departments (
	department_id INT NOT NULL AUTO_INCREMENT,
	department_name VARCHAR(100) NULL,
	over_head_costs INTEGER,
	PRIMARY KEY (department_id)
);