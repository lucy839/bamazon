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
    console.log("connected as id " + connection.threadId);
    // If no problem, start the app by loading data
    customer.loadData();
});

var customer = {
    // load data from mysql
    loadData: function () {
        var query = "SELECT * FROM products"
        connection.query(query, function (err, list) {
            if (err) throw err;
            // if no problem, call salesItem function within this object with list passed as parameter
            customer.salesItem(list)
        });
    },

    // function that gets space and return it, so that all rows and columns are lined up
    getSpace: function (length) {
        var space = " ";
        for (var i = 25; i >= length; i--) {
            space += " ";
        }
        return space;
    },

    //  function that welcome user and list the items in stock
    salesItem: function (list) {
        var space = " ";
        var spaceTwo = " ";
        console.log("Welcome to Bamazon!!!");
        for (var i in list) {
            console.log("ITEM ID : " + list[i].item_id +
                customer.getSpace(list[i].item_id.toString().length) + " PRODUCT NAME : " +
                list[i].product_name + customer.getSpace(list[i].product_name.length) + " PRICE : $" +
                list[i].price);
        }
        // call promptUser function to proceed the transaction after list is displayed
        customer.promptUser();
    },

    // function that asks user for item and quantity of their purchase
    promptUser: function () {
        inquirer
            .prompt([
                {
                    name: "item",
                    type: "input",
                    message: "Which item would you like to purchase? Please enter the item id",
                    validate: function (value) {
                        var valid = !isNaN(parseFloat(value));
                        return valid || "Please enter a number";
                    }
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like?",
                    validate: function (value) {
                        var valid = !isNaN(parseFloat(value));
                        return valid || "Please enter a number";
                    }
                }
            ])
            .then(function (response) {
                var itemNum = response.item;
                var itemQuantity = response.quantity;
                // once response is received, call checkInStock function with responses received
                customer.checkInStock(itemNum, itemQuantity);
            });
    },

    // function that check if enough quantity is instock for the item that user is trying to purchase
    checkInStock: function (itemNum, itemQuantity) {
        var query = "SELECT * FROM products"
        connection.query(query, function (err, res) {
            if (err) throw err;
            var currentStock = res[itemNum - 1].stock_quantity;
            // if enough in stock, proceed to update the inventory
            if (currentStock >= itemQuantity) {
                customer.update(itemNum, itemQuantity, currentStock);
            // if not enough in stock, let user know, and call promptContinue function to start over
            } else {    
                console.log("Sorry, Not enough in stock!");
                customer.promptContinue();
            }
        });
    },

    // function that update inventory using user input
    update: function (itemNum, itemQuantity, currentStock) {
        console.log("processing the order...");
        var updateStock = currentStock - itemQuantity;
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
                if (err) throw err;
                // once update has been done without any problem, call report functin to finish
                // transaction
                customer.report(itemNum, itemQuantity);
            }
        );
    },

    // function that gives report(receipt) to user by letting them know total cost
    // and update product_sales
    report: function (itemNum, itemQuantity) {
        var query = "SELECT * FROM products"
        connection.query(query, function (err, list) {
            var total = list[itemNum - 1].price * itemQuantity;
            console.log("You are purchasing " + itemQuantity + " " +
                list[itemNum - 1].product_name + "...TOTAL COST IS $" + total);
            var productSales = list[itemNum - 1].product_sales + total;
            var query = connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                    {
                        product_sales: productSales
                    },
                    {
                        item_id: itemNum
                    }
                ],
                function (err, res) {
                    if (err) throw err;
                    // update has been done without anyproblem,
                    // call promptContinue function to repeat the app
                    customer.promptContinue();
                }
            );
        });
    },

    // function that let user to decide whether to make another transaction or finish the app
    promptContinue: function () {
        inquirer
            .prompt({
                name: "again",
                type: "confirm",
                message: "Would you like to make another purchase?"
            })
            .then(function (answer) {
                if (answer.again === true) {
                    customer.loadData();
                } else {
                    console.log("Come back again soon!");
                    connection.end();
                }
            });
    }
}

