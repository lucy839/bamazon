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
    manager.promptManager();
});

var manager = {
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
                            manager.lowInventory();

                            break;
                        case ("Add to Inventory"):
                            manager.addProduct();

                            break;
                        case ("Add New Product"):

                            manager.newProduct();
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
    view: function (list) {
            for (var i in list) {
                console.log("ITEM ID : " + list[i].item_id + 
                    manager.getSpace(list[i].item_id.toString().length) + " PRODUCT NAME : " + 
                    list[i].product_name + manager.getSpace(list[i].product_name.length) + " PRICE : $" + 
                    list[i].price + manager.getSpace(list[i].price.toString().length) + 
                    " QUANTITIES : " + list[i].stock_quantity);

            }
            manager.promptContinue();
    },
    lowInventory: function () {
        console.log("These are low in stock!")
        var query = "SELECT * FROM products"
        connection.query(query, function (err, list) {
            if (err) throw err;
            for (var i in list) {
                if (list[i].stock_quantity < 5) {
                    var space = " ";
                    var spaceTwo = " ";
                    for (var j = 5; j >= list[i].item_id.toString().length; j--) {
                        space += " ";
                    }
                    for (var k = 20; k >= list[i].product_name.length; k--) {
                        spaceTwo += " ";
                    }
                    console.log("ITEM ID : " + list[i].item_id + space + " PRODUCT NAME : " + list[i].product_name +
                        spaceTwo + " QUANTITIES : " + list[i].stock_quantity);
                    space = " ";
                    spaceTwo = " ";
                }
            }
            manager.promptContinue();

        });

    },
    addProduct: function () {
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
                var query = "SELECT * FROM products"
                connection.query(query, function (err, list) {
                    var itemNum = response.item;
                    if (itemNum > list.length) {
                        console.log("Item number not exisitng. Please enter existing product.");
                        manager.addProduct();
                    } else {
                        var itemQuantity = response.quantity;
                        var currentStock = list[itemNum - 1].stock_quantity;
                        var updateStock = currentStock + parseInt(itemQuantity);
                        var query = connection.query(
                            "UPDATE products SET ? WHERE ?",
                            [
                                {
                                    stock_quantity: updateStock
                                },
                                {
                                    item_id: itemNum
                                }
                            ],
                            function (err, res) {
                                console.log("Here is an updated product!");
                                var space = " ";
                                var spaceTwo = " ";
                                for (var j = 5; j >= list[itemNum - 1].item_id.toString().length; j--) {
                                    space += " ";
                                }
                                for (var k = 20; k >= list[itemNum - 1].product_name.length; k--) {
                                    spaceTwo += " ";
                                }
                                console.log("ITEM ID : " + list[itemNum - 1].item_id + space + " PRODUCT NAME : " + list[itemNum - 1].product_name +
                                    spaceTwo + " QUANTITIES : " + list[itemNum - 1].stock_quantity);
                                manager.promptContinue();
                            }
                        );
                    }
                });
            });
    },
    newProduct: function () {
        inquirer
            .prompt([
                {
                    name: "name",
                    type: "input",
                    message: "What is the name of new product your adding? ",
                },
                {
                    name: "department",
                    type: "input",
                    message: "Which department are you adding to? ",
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
                // if it is already on the list, let user know to use other option.
                var query = "SELECT * FROM products"
                connection.query(query, function (err, list) {
                    for (var i in list) {
                        if (response.name == list[i].product_name) {
                            console.log("Item is already in stock. Please use Add to Inventory option to add");
                            manager.promptContinue();
                        } else {

                        }
                    } var query = connection.query(
                        "INSERT INTO products SET ?",
                        {
                            product_name: response.name,
                            department_name: response.department,
                            price: response.price,
                            stock_quantity: response.quantity
                        },
                        function (err, res) {
                            console.log("Product Registered");
                            // Call updateProduct AFTER the INSERT completes
                            manager.view();
                        }
                    );


                    // ele update the mysql
                    // call view();
                });
            });
    },

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