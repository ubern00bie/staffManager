DROP DATABASE IF EXISTS staff_manager;
CREATE DATABASE staff_manager;
USE staff_manager;

CREATE TABLE department(
  id INTEGER(11) AUTO_INCREMENT NOT NULL,
  name VARCHAR(30),
  PRIMARY KEY (id)
);

CREATE TABLE role(
  id INTEGER(11) AUTO_INCREMENT NOT NULL,
  title VARCHAR(30),
  salary DECIMAL(11),
  department_id INT(11),
  PRIMARY KEY (id)
);

CREATE TABLE employee(
  id INTEGER(11) AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT(11),
  manager_id INT(11),
  PRIMARY KEY (id)
);
-- Test Values --
INSERT INTO department(id, name) VALUES (1,'Operations'),(2,'IT');
INSERT INTO role(id, title, salary, department_id) VALUES (1,'Technician',40000,1),(2,'Developer',65000,2),(3,'Manager',95000,2);
INSERT INTO employee(id, first_name, last_name, role_id, manager_id) VALUES (1,'John','Smith',1,2),(2,'Lisa','Barth',2,2),(3,'Thomas','Moulder',2,2),(4,'Steven','Roberts',1,2),(5,'Stephanie','Williams',3,5);