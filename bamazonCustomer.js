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
    console.log("connected as id " + connection.threadId);
    loadData();
});

function loadData() {
    var query = "SELECT * FROM products"
}

var cusotmer = {
    loadData: function () {
        connection.query(query, function (err, res) {
            if (err) throw err;
            customer.salesItem(list)
        });
    },
    salesItem: function (list) {
        var space = " ";
        var spaceTwo = " ";
        for (var i in list) {
            for (var j = 5; j >= parseInt(parseInt(list[i].item_id) / 10); j--) {
                space += " ";
            }
            for (var k = 20; k >= list[i].product_name.length; k--) {
                spaceTwo += " ";
            }
            console.log("ITEM ID : " + list[i].item_id + space + " PRODUCT NAME : " + list[i].product_name +
                spaceTwo + " PRICE : $" + list[i].price);
            var space = " ";
            var spaceTwo = " ";
        }
        customer.promptUser();
    },
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
                //   console.log(res.item);
                //   console.log(res.quantity);
                customer.checkInStock(itemNum, itemQuantity);
                //   result(itemNum)
            });
    },
    checkInStock : function (itemNum, itemQuantity){
        var query = "SELECT * FROM products"
        connection.query(query, function (err, res) {
            if (err) throw err;
            // console.log(res);
            // console.log(res[itemNum-1].stock_quantity);
            var currentStock = res[itemNum - 1].stock_quantity;
    
            if (currentStock >= itemQuantity) {
                result(itemNum, itemQuantity, currentStock);
            } else {
                console.log("Sorry, Not enough in stock!");
                promptContinue();
            }
    
            // promptUser(res)
            // connection.end();
        });
    }


}

function result(itemNum, itemQuantity, currentStock) {
    var query = "SELECT * FROM products"
    connection.query(query, function (err, res) {
        if (err) throw err;
        // console.log(res);
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
                // console.log(res);
                // if (err){
                //     console.log(err);
                // }
                report(itemNum, itemQuantity);
            }
        );
        // Cconsole.log(res[itemNum-1].product_name);
        // promptUser(res)
        // connection.end();

    });

}

function report(itemNum, itemQuantity) {
    var query = "SELECT * FROM products"
    connection.query(query, function (err, res) {
        // console.log(res);
        console.log("You are purchasing " + itemQuantity + " " +
            res[itemNum - 1].product_name + "...TOTAL COST IS $" + (res[itemNum - 1].price * itemQuantity));
        promptContinue();
    });

}
function promptContinue() {
    inquirer
        .prompt({
            name: "again",
            type: "confirm",
            message: "Would you like to make another purchase?"
        })
        .then(function (answer) {
            if (answer.again === true) {
                loadData();
            } else {
                console.log("Come back again soon!");
                connection.end();
            }
        });
}