// packages required
require("dotenv").config();
var mysql = require("mysql");
var keys = require("./keys.js");
var inquirer = require("inquirer");

// for keeping password private
var myPassword = keys.keys.password;

// mysql connection 
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: myPassword,
    database: "bamazonDB"
});

// check the connection
connection.connect(function (err) {
    if (err) throw err;
    supervisor.promptSupervisor();
});

// rowCount for view 
const rowCount = 0; 

var supervisor = {
    // function that prompt supervisor to choose from the options and call function accordingly
    promptSupervisor: function () {
        inquirer
            .prompt([
                {
                    name: "menu",
                    type: "list",
                    message: "Welcome Supervisor! How can I help you?",
                    choices: ["View Product Sales by Department", "Create New Department"]
                }
            ])
            .then(function (res) {
                var query = "SELECT * FROM departments"
                connection.query(query, function (err, list) {
                    var command = res.menu;
                    switch (command) {
                        case ("View Product Sales by Department"):
                            supervisor.getProductSales(list);
                            break;
                        case ("Create New Department"):
                            supervisor.create(list);
                            break;
                    }
                });
            });
    },

    // function that gets space and return it, so that all rows and columns are lined up
    getSpace: function (length) {
        var space = " ";
        for (var i = 13; i >= length; i--) {
            space += " ";
        }
        return space;
    },

    // function that starts the table and call view function to create each row 
    getProductSales: function (list) {
        console.log("| Department_Id |Department_Name|Over_Head_Costs" +
            "| Product_Sales | total_Profit  |");
        var line = "";
        for (var i = 0; i < 5; i++) {
            line += "|";
            for (var j = 0; j < 15; j++) {
                line += "-";
            }
        }
        line += "|";
        console.log(line);
        for (var i in list) {
            supervisor.view(list[i], list.length);
        }
    },

    // function that creates each row by deparmtment name
    view: function (list, listLength) {
        connection.query(
            "SELECT * FROM products WHERE ?",
            {
                department_name: list.department_name
            },
            function (err, res) {
                var productSales = 0;
                for (var k in res) {
                    if (res[k].product_sales != null) {
                        productSales += res[k].product_sales;
                    }
                }
    
                var row = "|" + list.department_id + supervisor.getSpace(list.department_id.toString().length) +
                    "|" + list.department_name + supervisor.getSpace(list.department_name.length) + "|" +
                    list.over_head_costs + supervisor.getSpace(list.over_head_costs.toString().length) + "|" +
                    productSales + supervisor.getSpace(productSales.toString().length);

                var profit = productSales - list.over_head_costs;

                row += "|" + profit + supervisor.getSpace(profit.toString().length);
                console.log(row + "|");
                rowCount++;
                row = "";
                
                // if all rows are created, call promptContinue function to ask 
                // if supervisor wants to do another job
                if (rowCount == listLength){
                    supervisor.promptContinue();
                }
            });
    },

    // function to create new department
    create: function (list) {
        inquirer
            .prompt([
                {
                    name: "name",
                    type: "input",
                    message: "What is the name of department your adding? ",
                },
                {
                    name: "overhead",
                    type: "input",
                    message: "What is the over head cost? ",
                    validate: function (value) {
                        var valid = !isNaN(parseFloat(value));
                        return valid || "Please enter a number";
                    }
                },
            ])
            .then(function (response) {
                 // make sure the depatment is not already existing
                var inStock = false;
                for (var i in list) {
                    if (response.name.toLowerCase() == list[i].department_name.toLowerCase()) {
                        inStock = true;
                    }
                }
                if (inStock) {
                    console.log("deparmtent is already in stock. Please use Add to Inventory option to add");
                    supervisor.promptContinue();
                } else {
                    var query = connection.query(
                        "INSERT INTO departments SET ?",
                        {
                            department_name: response.name,
                            over_head_costs: response.overhead,
                        },
                        function (err, res) {
                            console.log("Department Registered");
                            // call promptContinue function to ask if supervisor wants to do another job
                            supervisor.promptContinue();
                        }
                    );
                }
            });
    },

     // function that let supervisor to decide whether to do another job or finish the app
    promptContinue: function () {
        inquirer
            .prompt({
                name: "again",
                type: "confirm",
                message: "Would you like to go back??"
            })
            .then(function (answer) {
                if (answer.again === true) {
                    supervisor.promptSupervisor();
                } else {
                    console.log("Come back again soon!");
                    connection.end();
                }
            });
    }
}