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
    // If no problem, start the app by prompting manager
    manager.promptManager();
});

var manager = {
    // function that prompt manager to choose from the options and call function accordingly
    promptManager: function () {
        inquirer
            .prompt([
                {
                    name: "menu",
                    type: "list",
                    message: "Welcome Manager! How can I help you?",
                    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory",
                        "Add New Product"]
                }
            ])
            .then(function (res) {
                var command = res.menu;
                var query = "SELECT * FROM products"
                connection.query(query, function (err, list) {
                    if (err) throw err;
                    switch (command) {
                        case ("View Products for Sale"):
                            manager.view(list);
                            break;
                        case ("View Low Inventory"):
                            manager.lowInventory(list);

                            break;
                        case ("Add to Inventory"):
                            manager.addProduct(list);

                            break;
                        case ("Add New Product"):

                            manager.newProduct(list);
                            break;
                    }
                });
            });
    },

    // function that gets space and return it, so that all rows and columns are lined up
    getSpace: function (length) {
        var space = " ";
        for (var i = 18; i >= length; i--) {
            space += " ";
        }
        return space;
    },

    // function that gives the list of items in stock 
    view: function (list) {
        for (var i in list) {
            console.log("ITEM ID : " + list[i].item_id +
                manager.getSpace(list[i].item_id.toString().length) + " PRODUCT NAME : " +
                list[i].product_name + manager.getSpace(list[i].product_name.length) + " PRICE : $" +
                list[i].price + manager.getSpace(list[i].price.toString().length) +
                " QUANTITIES : " + list[i].stock_quantity);
        }
        // call promptContinue function to ask if manager wants to do another job
        manager.promptContinue();
    },

    // function that sorts any items less than 5 in stock and give that list to manager
    lowInventory: function (list) {
        console.log("These are low in stock!")
        for (var i in list) {
            if (list[i].stock_quantity < 5) {
                console.log("ITEM ID : " + list[i].item_id +
                    manager.getSpace(list[i].item_id.toString().length) + " PRODUCT NAME : " +
                    list[i].product_name + manager.getSpace(list[i].product_name.length) +
                    " QUANTITIES : " + list[i].stock_quantity);
            }
        }
        // call promptContinue function to ask if manager wants to do another job
        manager.promptContinue();
    },

    // function that adds product to existing inventory
    addProduct: function (list) {
        inquirer
            .prompt([
                {
                    name: "item",
                    type: "input",
                    message: "Which product do you want to add in stock? Please enter the item id",
                    validate: function (value) {
                        var valid = !isNaN(parseFloat(value));
                        return valid || "Please enter a number";
                    }
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to add?",
                    validate: function (value) {
                        var valid = !isNaN(parseFloat(value));
                        return valid || "Please enter a number";
                    }
                }
            ])
            .then(function (response) {
                // check if item number is existing
                if (response.item > list.length) {
                    console.log("Item number not exisitng. Please enter existing product.");
                    manager.addProduct();
                } else {
                    // update inventory
                    var updateStock = list[response.item - 1].stock_quantity + parseInt(response.quantity);
                    var query = connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: updateStock
                            },
                            {
                                item_id: response.item
                            }
                        ],
                        function (err, res) {
                            if (err) throw err;
                            // let user know of updated product
                            console.log("Here is an updated product!");
                            console.log("ITEM ID : " + response.item +
                                manager.getSpace(list[response.item - 1].item_id.toString().length) +
                                " PRODUCT NAME : " + list[response.item - 1].product_name +
                                manager.getSpace(list[response.item - 1].product_name.length) +
                                " QUANTITIES : " + updateStock);
                            // call promptContinue function to ask if manager wants to do another job
                            manager.promptContinue();
                        }
                    );
                }
            });
    },

    // function to add brand new product
    newProduct: function (list) {
        // make list of department names without redundancy
        var choices = [];
        for (var i in list) {
            if (choices.indexOf(list[i].department_name) == -1){
                choices.push(list[i].department_name);
            }
        }
        inquirer
            .prompt([
                {
                    name: "name",
                    type: "input",
                    message: "What is the name of new product your adding? ",
                },
                {
                    name: "department",
                    type: "list",
                    message: "Which department are you adding to? ",
                    choices: choices
                },
                {
                    name: "price",
                    type: "input",
                    message: "What is the price of product? ",
                    validate: function (value) {
                        var valid = !isNaN(parseFloat(value));
                        return valid || "Please enter a number";
                    }
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to add?",
                    validate: function (value) {
                        var valid = !isNaN(parseFloat(value));
                        return valid || "Please enter a number";
                    }
                }
            ])
            .then(function (response) {
                // make sure the item is not already in stock
                var inStock = false;
                for (var i in list) {
                    if (response.name.toLowerCase() == list[i].product_name.toLowerCase()) {
                        inStock = true;
                    }
                }
                if (inStock) {
                    console.log("Item is already in stock. Please use Add to Inventory option to add");
                    manager.promptContinue();

                } else {
                    // update inventory
                    var query = connection.query(
                        "INSERT INTO products SET ?",
                        {
                            product_name: response.name,
                            department_name: response.department,
                            price: response.price,
                            stock_quantity: response.quantity
                        },
                        function (err, res) {
                            console.log("Product Registered");
                            // call promptContinue function to ask if manager wants to do another job
                            manager.promptContinue();
                        }
                    );
                }
            });

    },

    // function that let manager to decide whether to do another job or finish the app
    promptContinue: function () {
        inquirer
            .prompt({
                name: "again",
                type: "confirm",
                message: "Would you like to go back??"
            })
            .then(function (answer) {
                if (answer.again === true) {
                    manager.promptManager();
                } else {
                    console.log("Come back again soon!");
                    connection.end();
                }
            });
    }
}