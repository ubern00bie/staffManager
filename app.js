//Required modules
const inquirer = require("inquirer");
const mysql = require("mysql");

//Establish connection with server
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "staff_manager"
});
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");    
  menu()
});

//User Menu Prompt
function menu(){
  return inquirer.prompt(
    [{
      name:"task",
      type:"list",
      message:"What would you like to do?",
      choices:[
        "View All Employees", 
        "View Employee", 
        "View Employees By Department", 
        "View Employees By Role", 
        "Add Employee", 
        "Remove Employee", 
        "Update Employee Role", 
        "Update Employee Manager",
        "Add Department", 
        "Add Role",
        "EXIT"
      ]}
    ]).then ((task) => {
      execute(task);
    })
}
//Associated function to execute user's menu choice
function execute(task){
  switch(task.task){
    case "View All Employees": viewAllEmployees(); break;
    case "View Employee": employeePrompt(); break;
    case "View Employees By Department": viewDepartmentPrompt();break;
    case "View Employees By Role": viewRolePrompt();break;
    case "Add Employee": addEmployeePrompt();break;
    case "Remove Employee": removeEmployeePrompt();break;
    case "Update Employee Role": updateEmployeeRolePrompt();break;
    case "Update Employee Manager": updateEmployeeManagerPrompt();break;
    case "Add Department": departmentPrompt();break;
    case "Add Role": rolePrompt() ;break;
    default:connection.end(); console.log('Goodbye!'); break;
  }
}

//Add Department Prompt
function departmentPrompt(){
  inquirer.prompt([
    {
      name: "name",
      type: "input",
      message: "Name of new Department: " 
    }
  ]).then((department) => {
    addDepartment(department.name);
  })
}
//Associated function to insert department into database  
function addDepartment(userDepartment) {
console.log(`Adding new department: ${userDepartment} ...\n`);
connection.query(`INSERT INTO department (name) VALUES ('${userDepartment}')`, function(err, res) {
  if (err) throw err;
  menu()
});
}

//Add Role Prompt
function rolePrompt() {
  connection.query("SELECT * FROM department", function (error, res) {
      departmentList = res.map(dep => ({ name: dep.name, value: dep.id }))
  inquirer.prompt([
  {
  name: "title",
  type: "input",
  message: "Name of new role: "
  },
  {
  name: "salary",
  type: "input",
  message: "Salary: "
  },
  { 
  name: "department",
  type: "list",
  choices: departmentList
  }
]).then((role) => {
  addRole(role.title,role.salary,role.department);
})
})
}
//Associated function to insert role into database 
function addRole(userTitle, userSalary, userDepartment_id) {
  console.log(`Adding new role: ${userTitle} salary: ${userSalary} department id: ${userDepartment_id} ...\n`);
  connection.query(`INSERT INTO role (title, salary, department_id) VALUES ('${userTitle}',${userSalary},${userDepartment_id})`, function(err, res) {
    if (err) throw err;
    menu()
  });
}

//Add employee prompt
function addEmployeePrompt(){
  connection.query("SELECT * FROM role", function (error, res) {
      roleList = res.map(role => ({ name: role.title, value: role.id }))
  inquirer.prompt([
    {
    name: "first_name",
    type: "input",
    message: "First Name: "
    },
    {
    name: "last_name",
    type: "input",
    message: "Last Name: "
    },
    { 
    name: "role_id",
    type: "list",
    choices: roleList
    },
    { 
    name: "manager_id",
    type: "input",
    message: "Manager Id:"
    }
]).then((employee) => {
  addEmployee(employee.first_name,employee.last_name,employee.role_id,employee.manager_id)
  })
})
}
//Associated function to insert employee into database 
function addEmployee(first_name, last_name, role_id, manager_id) {
  console.log(`Adding new employee ${first_name} ${last_name}, Role id: ${role_id}, Manager id: ${manager_id}\n`);
  connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${first_name}','${last_name}', ${role_id}, ${manager_id})`, function(err, res) {
    if (err) throw err;
    console.log('Employee added!');
    menu()
  });
}

//View Department Prompt - displays available departments to user
function viewDepartmentPrompt(){
  connection.query("SELECT * FROM department", function (error, res) {
    departmentList = res.map(dep => ({ name: dep.name, value: dep.id }))
  inquirer.prompt({
    name: "department",
    type: "list",
    choices: departmentList
  }).then ((department) => {
    viewDepartment(department.department)
  })
})
}
//Associated function to retrieve all departments from the database
function viewDepartment(department_id) { 
  console.log(`Retrieving department information...\n`);
  connection.query(`
  SELECT employee.first_name, employee.last_name, role.title, role.department_id, department.name
  FROM employee 
  INNER JOIN role
  ON (employee.role_id = role.id)
  INNER JOIN department
  ON (role.department_id = department.id)
  WHERE role.id = ${department_id};`, function(err, res) { 
    if (err) throw err;
    console.table(res);
    menu()
  });
}

//View Role Prompt - displays all available rows for user to choose from
function viewRolePrompt(){
  connection.query("SELECT * FROM role", function (error, res) {
      roleList = res.map(role => ({ name: role.title, value: role.id }))
  inquirer.prompt({
    name: "role",
    type: "list",
    choices: roleList
  }).then((role) => {
    viewRole(role.role);
  })
})
}
//Associated function to retrieve all roles from the database
function viewRole(role_id) {
  console.log(`Finding all Employees that match role_id: ${role_id} \n`);
  connection.query(`SELECT employee.first_name, employee.last_name, employee.role_id, role.title, role.salary
  FROM employee 
  INNER JOIN role
  ON (employee.role_id = role.id)
  WHERE employee.role_id = ${role_id}`, function(err, res) {
    if (err) throw err;
    console.table(res);
    menu()
  });
}

//View Employee Prompt - displays list of all employees for user to choose from
function employeePrompt(){
  connection.query("SELECT * FROM employee", function (error, res) {
      employeeList = res.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
  inquirer.prompt([
    { 
      name: "id",
      type: "list",
      choices: employeeList
      }
    ]).then((employee) => {
      viewEmployee(employee.id);
    })
  })
}
//Associated function which displays information for specified employee
function viewEmployee(employee_id) {
  console.log(`Finding employee matching id: ${employee_id} \n`);
  connection.query(`SELECT employee.first_name, employee.last_name, employee.role_id, role.title, role.salary
  FROM employee 
  JOIN role
  ON (employee.role_id = role.id)
  JOIN department
  ON (role.department_id = department.id)
  WHERE employee.id = ${employee_id}`, function(err, res) {
    if (err) throw err;
    console.table(res);
    menu()
  });
}

//Employee Role Prompt - displays all roles to filter by
function updateEmployeeRolePrompt(){
  connection.query("SELECT * FROM employee", function (error, res) {
    employeeList = res.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
  connection.query("SELECT * FROM role", function (error, res) {
      roleList = res.map(role => ({ name: role.title, value: role.id }))
  inquirer.prompt([
    { 
    name: "id",
    type: "list",
    choices: employeeList
    },
    { 
    name: "role_id",
    type: "list",
    message: "Choose a new Role for this employee",
    choices: roleList
    }
    ]).then((employee) => {
      updateEmployeeRole(employee.id,employee.role_id );
    })
  })
})
}
//Associated function which displays all employees which have the specified role
function updateEmployeeRole(employee_id, role_id) {
  console.log(`Changing employee id: ${employee_id} role to: ${role_id} \n`);
  connection.query(`UPDATE employee SET role_id = ${role_id} WHERE employee.id = ${employee_id};`, function(err, res) {
    if (err) throw err;
    console.log('Updated employee role!')
    menu()
  });
}

//Function to view all employees
function viewAllEmployees() {
  console.log(`Finding all employees \n`);
  connection.query(`SELECT employee.first_name, employee.last_name, employee.role_id, role.title, role.salary
  FROM employee 
  JOIN role
  ON (employee.role_id = role.id)
  JOIN department
  ON (role.department_id = department.id)`, 
  function(err, res) {
    if (err) throw err;
    console.table(res);
    menu()
  });
}

//Remove Employee prompt - displays list of employees to choose from
function removeEmployeePrompt(){
  connection.query("SELECT * FROM employee", function (error, res) {
    employeeList = res.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
  inquirer.prompt({ 
    name: "id",
    type: "list",
    choices: employeeList
    }).then((employee) => {
      removeEmployee(employee.id)
    })
  })
}
//Associated function which deletes specified user
function removeEmployee(employee_id) {
  console.log(`Removing employee from database\n`);
  connection.query(`DELETE FROM employee WHERE id = ${employee_id}`, function(err, res) {
    if (err) throw err;
    menu()
  });
}

//Update Manager Prompt - displays all employees to choose from 
function updateEmployeeManagerPrompt(){
  connection.query("SELECT * FROM employee", function (error, res) {
    employeeList = res.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
  inquirer.prompt([
    { 
    name: "id",
    type: "list",
    choices: employeeList
    },
    { 
    name: "manager_id",
    type: "input",
    message: "Manager id:",
    }
    ]).then((employee) => {
      updateEmployeeManager(employee.id,employee.manager_id );
    })
  })
}
//Associated function which sets employee's new manager in database
function updateEmployeeManager(employee_id, manager_id){
  console.log(`Changing employee id: ${employee_id} manager to: ${manager_id} \n`);
  connection.query(`UPDATE employee SET manager_id = ${manager_id} WHERE employee.id = ${employee_id};`, function(err, res) {
    if (err) throw err;
    console.log("Employee's manager has been updated!");
    menu()
  });
}
