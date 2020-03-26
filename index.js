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