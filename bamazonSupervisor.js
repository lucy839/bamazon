require("dotenv").config();
var mysql = require("mysql");
var keys = require("./keys.js");
var inquirer = require("inquirer");

var myPassword = keys.keys.password;
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: myPassword,
    database: "bamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
    supervisor.promptSupervisor();
});

var supervisor = {
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
                            // supervisor.view(list);
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
                            supervisor.getProductSales(list[i]);
                            }
                            break;
                        case ("Create New Department"):
                            // supervisor.create();
                            break;
                    }
                });
            });

    },
    view: function (list, productSales) {
        // console.log(list);
        var row = "";


        // for (var i in list) {
        row += "|" + list.department_id;
        for (var j = 15; j > list.department_id.toString().length; j--) {
            row += " ";
        }
        row += "|" + list.department_name;
        for (var j = 15; j > list.department_name.length; j--) {
            row += " ";
        }
        row += "|" + list.over_head_costs;
        for (var j = 15; j > list.over_head_costs.toString().length; j--) {
            row += " ";
        }
        row += "|" + productSales;
        for (var j = 15; j > productSales.toString().length; j--) {
            row += " ";
        }
        var profit = productSales - list.over_head_costs;
        row += "|" + profit;
        for (var j = 15; j > profit.toString().length; j--) {
            row += " ";
        }
  

        console.log(row +"|");

        row = "";
     
    },
    getProductSales: function (list) {
        // console.log(list);
    
     
        // for (var i in list) {
            connection.query(
                "SELECT * FROM products WHERE ?",
                {
                    department_name: list.department_name
                },
                function (err, res) {
                    var productSales = 0;
                    for (var k in res) {

                        // console.log(res[k].product_sales);
                        if (res[k].product_sales != null) {
                            productSales += res[k].product_sales;
                        }

                    }
                    // console.log(productSales);
                    supervisor.view(list, productSales);

                }

            );

    }
}