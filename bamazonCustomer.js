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
    customer.loadData();
});



var customer = {
    loadData: function () {
        var query = "SELECT * FROM products"
        connection.query(query, function (err, list) {
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
 
                customer.checkInStock(itemNum, itemQuantity);

            });
    },
    checkInStock : function (itemNum, itemQuantity){
        var query = "SELECT * FROM products"
        connection.query(query, function (err, res) {
            if (err) throw err;
            var currentStock = res[itemNum - 1].stock_quantity;
    
            if (currentStock >= itemQuantity) {
                customer.update(itemNum, itemQuantity, currentStock);
            } else {
                console.log("Sorry, Not enough in stock!");
                customer.promptContinue();
            }
    
        });
    },
    update :function (itemNum, itemQuantity, currentStock){
      
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
                    customer.report(itemNum, itemQuantity);
                }
            );
    
    },
    report : function (itemNum, itemQuantity){
        var query = "SELECT * FROM products"
        connection.query(query, function (err, list) {
            // console.log(res);
            console.log("You are purchasing " + itemQuantity + " " +
                list[itemNum - 1].product_name + "...TOTAL COST IS $" + (list[itemNum - 1].price * itemQuantity));
            customer.promptContinue();
        });
    },
    promptContinue : function(){
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

