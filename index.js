const cliArt = require("figlet");
const inquirer = require("inquirer");
const clear = require("clear");
const chalk = require("chalk");
const util = require("util");
const mysql = require("mysql");

//Connect to the database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "gojila1171",
    database: "employee_template_db"
});
connection.connect(function(err) {
    if (err) throw err;

    //Initiates the clear function
    clear();

    //Produces the ASCII art
    console.log(chalk.blue(cliArt.textSync('Employee Management', {horizontalLayout: 'fitted'})));
    console.log("\n");

    //Calls the initiate function
    initiate();
});

connection.query = util.promisify(connection.query);

//Initiate questions
function initiate(){
    inquirer
        .prompt([
            {
            name: "userSelect",
            type: "list",
            message: "Pick an option.",
            choices: ["View entry", "Add entry", "Update entry", "Exit"]
            }
        ])
        .then(answer => {
            if (answer.userSelect === "View entry"){
                viewEntry();
            }
            else if (answer.userSelect === "Add entry"){
                addEntry();
            }
            else if (answer.userSelect === "Update entry"){
                updateEntry();
            }
            else if (answer.userSelect === "Exit"){
                endProgram();
            }
    });
}

//Prompt user to view entry
function viewEntry(){
    inquirer
        .prompt([
            {
                name: "userView",
                type: "list",
                message: "Pick a view option.",
                choices: ["View Departments", "View Roles", "View Employees", 
                "View Employees by Department", "View Employees by Role", "View Managers", "Return to Menu"]
            }
        ])
        .then(answer => {
            if (answer.userView === "View Departments"){
                viewDepartment();
            }
            else if (answer.userView === "View Roles"){
                viewRoles();
            }
            else if (answer.userView === "View Employees"){
                viewEmployees();
            }
            else if (answer.userView === "View Employees by Department"){
                employeeDepartment();
            }
            else if (answer.userView === "View Employees by Role"){
                employeeRole();
            }
            else if (answer.userView === "View managers"){
                viewManager();
            }
            else if (answer.userView === "Return to menu"){
                initiate();
            }
            else{
                connection.end();
            }
        })
}

//Prompt user to add entry
function addEntry(){
    inquirer
        .prompt([
            {
                name: "userAdd",
                type: "list",
                message: "Pick an option to add",
                choices: ["Add a department", "Add an employee", "Add a job role", "Return to menu"]
            }
        ])
        .then(answer => {
            if (answer.userAdd === "Add a department"){
                addDepartment();
            }
            else if (answer.userAdd === "Add an employee"){
                addEmployee();
            }
            else if (answer.userAdd === "Add a job role"){
                addRole();
            }
            else if (answer.userAdd === "Return to menu"){
                initiate();
            }
            else{
                connection.end();
            }
        })
}

//Prompt user to update entry
function updateEntry(){
    inquirer
        .prompt([
            {
                name: "userUpdate",
                type: "list",
                message: "Pick an option to update.",
                choices: ["Delete a department", "Delete a job role", "Delete an employee", "Update an employee's role", "Return to menu"]
            }
        ])
        .then(answer => {
            if (answer.userUpdate === "Delete a department"){
                deleteDepartment();
            }
            else if (answer.userUpdate === "Delete an employee"){
                deleteEmployee();
            }
            else if (answer.userUpdate === "Delete a job role"){
                deleteRole();
            }
            else if (answer.userUpdate === "Update an employee's role"){
                updateEmployeeRole();
            }
            else if (answer.userUpdate === "Return to menu"){
                initiate();
            }
            else{
                connection.end();
            }
        })
}

//Prompt user to add a department
function addDepartment(){
    inquirer
        .prompt([
            {
                name: "userDepartment",
                type: "input",
                message: "Add a department."
            }
        ])
        .then(answer => {
            connection.query(
                "INSERT INTO department SET ?",
                {
                    name: answer.userDepartment
                },
                (err => {
                    if (err) throw err;
                    console.log("\n");
                    console.log("Successfully added a department.")
                    console.log("\n");
                    initiate();
                })
            )
        })
}

//Prompt user to add an employee
function addEmployee(){
    readRoles().then(roles => {
        const userRoleChoice = roles.map(({title: name, id: value}) => ({name, value}));
        inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "Enter the employee's first name:"
            },
            {
                name: "lastName",
                type: "input",
                message: "Enter the employee's last name:"
            },
            {
                name: "employeeRole",
                type: "list",
                message: "Select the employee's job role:",
                choices: userRoleChoice
            },
            {
                name: "employeesManager",
                type: "input",
                message: "Enter the name of this employee's manager. If none, type N/A :",
            }
        ])
        .then(answer => {
            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answer.firstName,
                    last_name: answer.lastName,
                    role_id: answer.employeeRole,
                    manager_name: answer.employeesManager

                },
                (err => {
                    if (err) throw err;
                    console.log("\n");
                    console.log("Employee added succesfully!")
                    console.log("\n");
                    initiate();
                })
            )
            })
    })
}

//Prompt user to add a role
function addRole(){
    readDept().then(department => {
    const getDeptChoice = department.map(({name: name, id: value}) => ({name, value}));
    inquirer
        .prompt([
            {
                name: "userRoleAdd",
                type: "input",
                message: "Enter the name of the role you want to add:"
            },
            {
                name: "userSalaryAdd",
                type: "input",
                message: "Add a salary for this role. Enter numbers only:"
            },
            {
                name: "userRoleDeptAdd",
                type: "list",
                message: "Pick a department for this role:",
                choices: getDeptChoice
            }
        ])
        .then(answer => {
            connection.query(
                "INSERT INTO roles SET ?",
                {
                    title: answer.userRoleAdd,
                    salary: answer.userSalaryAdd,
                    department_id: answer.getDeptChoice
                },
                (err => {
                    if (err) throw err;
                    console.log("\n");
                    console.log("New role added successfully!")
                    console.log("\n");
                    initiate();
                })
            )
        })
    })    
}

//Prompt user to search employess by department
function employeeDepartment(){
    readDept().then(department => {
        const employeeDept = department.map(({name: name, id: value}) => ({name, value}));
        inquirer
            .prompt([
                {
                    name: "employeeDepartment",
                    type: "list",
                    message: "Select a department to view employees:",
                    choices: employeeDept,
                }
                ])
                .then(answer => {
                    let query = "SELECT * FROM employee WHERE role_id = ?";
                    connection.query(query, [answer.employeeDepartment], 
                        async function(err, res) {
                            if (err) throw err;

                            try {
                                console.log("\n");
                                console.table("Roles",res);
                                console.log("\n");
                                await initiate();
                            }
                            catch(err) {
                                console.log(err);
                            }
                    }
                )})
                .catch(err => {
                    console.log(err);
                })
})};

//Prompt user to search employees by role
function employeeRole(){
    readRoles().then(roles => {
        const employeeRole = roles.map(( {title: name, id: value}) => ({name, value}));
        inquirer
            .prompt({
                name: "userEmployeeRole",
                type: "list",
                message: "Select a role to view employees:",
                choices: employeeRole
            })
            .then(answer => {
                let query = "Select * FROM employee WHERE role_id = ?";
                connection.query(query, [answer.userEmployeeRole],
                    async function(err, res){
                        if(err) throw err;

                        try {
                            console.log("\n");
                            console.table("Employee", res);
                            console.log("\n");
                            await initiate();
                        }
                        catch (err){
                            console.log(err);
                        }
                    })
            })
            .catch(err => {
                console.log(err);
            })
    })
}

//Prompt to delete department from database
function deleteDepartment(){
    readDept().then(department => {
        const delDept = department.map(({name: name, id: value}) => ({name, value}));
            inquirer
                .prompt([
                    {
                        name: "deleteDept",
                        type: "list",
                        message: "Select a department to delete:",
                        choices: delDept
                    }
                ])
                .then(answer => {
                    connection.query("DELETE FROM department WHERE id = ?", [answer.deleteDept],
                        async function(err, res){
                            if(err) throw err;
                            try{
                                console.log("\n");
                                console.log("Department removed successfully!")
                                console.log("\n");
                                await initiate();
                            }
                            catch(err){
                                console.log(err);
                            }
                        });
                });
            
    });
};

//Prompt to delete employee from database
function deleteEmployee(){
    readEmployee().then(employee => {
        const delEmployee = employee.map(({first_name: name, id: value}) => ({name, value}));
            inquirer
                .prompt([
                    {
                        name: "deleteEmp",
                        type: "list",
                        message: "Select an employee to remove:",
                        choices: delEmployee
                    }
                ])
                .then(answer => {
                    connection.query("DELETE FROM employee WHERE id = ?", [answer.deleteEmp], 
                        async function(err, res){
                            if(err) throw err;
                            try {
                                console.log("\n");
                                console.log("Employee removed successfully!")
                                console.log("\n");
                                await initiate();
                            }
                            catch(err){
                                console.log(err);
                            }
                        });
                });
        });
};

//Prompt to delete role from database
function deleteRole(){
    readRoles().then(roles => {
        const delRoles = roles.map(({title: name, id: value}) => ({name, value}));
        inquirer
            .prompt([
                {
                    name: "deleteRole",
                    type: "list",
                    message: "Select a role to remove:",
                    choices: delRoles
                }
            ])
            .then(answer => {
                connection.query("DELETE FROM roles WHERE id = ?", [answer.deleteRole],
                async function(err, res){
                    if(err) throw err;
                    try {
                        console.log("Job role removed successfully!")
                        await initiate();
                    }
                    catch(err){
                        console.log(err);
                    }
                });
            
            })
    })
}

//Prompt to update an employee role
async function updateEmployeeRole(){
    try{
        const roles = await readRoles();
        const employee = await readEmployee();
        const allRole = roles.map(({title: name, id: value}) => ({name, value}));
        const allEmp = employee.map(({first_name: name, id: value}) => ({name, value}));

        inquirer
            .prompt([
                {
                    name: "userEmployee",
                    type: "list",
                    message: "Choose an employee to change roles:",
                    choices: allEmp
                },
                {
                    name: "userRole",
                    type: "list",
                    message: "Select a new role for this employee:",
                    choices: allRole
                }
            ])
            .then(answer => {
                connection.query("UPDATE employee SET role_id = ? WHERE role_id = ?;", [answer.userEmployee, answer.userRole],
                    async function(err, res){
                        if(err) throw err;
                        try{
                            console.log("\n");
                            console.log("New role has been added successfully!");
                            console.log("\n");
                            await initiate();
                        }
                        catch(err){
                            console.log(err);
                        }
                    })
            })
    }
    catch(err){
        console.log(err);
    }
}

//View departments from database
function viewDepartment(){
    connection.query("SELECT * FROM department;",
    async function (err, res){
        try {
            if (err) throw err;
            console.log("\n");
            console.table("department", res);
            console.log("\n");
            await initiate();
        }
        catch(err){
        console.log(err);
        }
    })
}

//View employees from database
function viewEmployees(){
    connection.query("SELECT * FROM employee;",
    async function (err, res){
        try {
            if (err) throw err;
            console.log("\n");
            console.table("employee", res);
            console.log("\n");
            await initiate();
        }
        catch(err){
        console.log(err);
        }
    })
}  

//View job roles from database
function viewRoles(){
    connection.query("SELECT * FROM roles;",
    async function (err, res){
        try {
            if (err) throw err;
            console.log("\n");
            console.table("roles", res);
            console.log("\n");
            await initiate();
        }
        catch(err){
        console.log(err);
        }
    })
}

//View managers from database
function viewManager(){
    connection.query("SELECT manager_name AS Manager, CONCAT(first_name, ' ', last_name) AS Employee FROM employee;",
    async function (err, res){
        try {
            if (err) throw err;
            console.log("\n");
            console.table("employee", res);
            console.log("\n");
            await initiate();
        }
        catch(err){
        console.log(err);
        }
    })
}

//Retrieve job roles from database
function readRoles(){
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM roles;",
        function (err, res){
            if(err) reject (err);
            resolve(res);
        })
    })
}

//Retrieve department from database
function readDept(){
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM department;",
        function (err, res){
            if(err) reject (err);
            resolve(res);
        })
    })
}

//Retrieve employees from database
function readEmployee(){
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM employee", 
            function(err, res){
                if(err) reject(err);
                resolve(res);
            });
    });
};

//End the program and close database connection
function endProgram() {
    clear();
    console.log(chalk.greenBright("Exiting Employee Management System"));
    process.exit();
}