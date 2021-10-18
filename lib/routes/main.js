//main.js file
module.exports = function(app) {
    // DESC: description
    
        // DESC: Render about page
        // When user enters '/about' link, sends a GET req for the middleware to render 'about.html' page
        app.get("/about", function (req, res) {
            res.render("about.html");
        });
    
        // DESC: Render addfood page
        // When user enters '/addfood' link, sends a GET req for the middleware to render 'addfood.html' page.
        // Returns a json object to determine successful addition.
        app.get("/addfood", function(req,res){
            res.render("addfood.html",{success: null});
        })
    
        // DESC: Adding food to database
        // When user enters submit button in /addfood page, it will send a POST req thru the action '/foodadded'. 
        // Here, the values stored in the req.body will be from the text input values entered by the user. 
        // These values will be passed into the db.query function to add these values into a new food item. 
        // Upon successful addition, the page will refresh itself, and print out a success message.
        // Otherwise, it will refresh print out an error message.
        app.post("/foodadded", function (req,res) {
            let sqlquery = "INSERT INTO food (name, amount, unit, calories, carbs, fats, protein, salt, sugar) VALUES (?,?,?,?,?,?,?,?,?)"; 
            // execute sql query
            let newrecord = [req.body.name, req.body.amount, req.body.unit, req.body.calories, req.body.carbs, req.body.fats, req.body.protein, req.body.salt, req.body.sugar]; //kcal because of input_name in addfood.html
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    res.render('addfood.html', {success: false});
                }
                else{
                    res.render('addfood.html', {success: true});
                }
                }); 
        });
    
        // DESC: Calculate total food nutrition values and render page
        // When user enters submit button in /list page, it will send a POST req thru the action '/calculate'. 
        // The values passed thru the req will be the selected checkboxes and quantity (textbox) entered by the user. 
        // The db queries for these selected food items, and then adds the quantity into the food JSON objects.
        // The food JSON objects will then be passed to the rendered page /calculaterecipe.
        app.post("/calculate", function(req,res){ 
            var food={};
            let sqlquery = "SELECT * from food WHERE id in (" + req.body.check + ")";
            // store all the values of textbox into quantities
            // so quantities is an array of numbers ["3", "5"] etc.
            var quantities= req.body.quantity;
            db.query(sqlquery, (err, result) => {
                if (err) {
                    return console.error(err.message);
                }
                else{
                    // store all JSON obj of the selected food items in food
                    // so food is an array of JSON obj now. food[0] will return one JSON obj with many keys and values
                    // food[0] = {"id": 9, "name" : "flour" ... } etc 
                    food = result;
                    for(var i=0; i<food.length; i++){
                        // add the quantity input by the user to the food JSON for easier looping in html
                        food[i]["quantity"] = quantities[i];
                    }
                    res.render("calculaterecipe.html", {selectedFood : food})
                }
            }); 
        });
    
        // DESC: Render update food page
        // When the user clicks on the 'edit' button in /list, it will send a GET req to the link /updatefood:/id
        // The id will be concatenated with the url, and it will be used for db querying to get the selected food details.
        // Then the response will be to render /updatefood with the selected food JSON.
        app.get("/updatefood/:id", function(req,res){
            let sqlquery = "SELECT * from food WHERE id = ?";
            // get the food.id from url to query in db
            let id = [req.params.id];
            db.query(sqlquery, id, (err, result) => {
                if(err) {
                    return console.error(err.message);
                }
                else{
                    // only send one JSON obj back -> the food item
                    res.render("updatefood.html", {food: result[0]});
                }
            });
        })
    
        // DESC: UPDATING food in db
        // Once the user entered the submit button in /updatefood, the new values will be passed into the POST req here
        // The db then updates accordingly based on the new values input by the user.
        // Once done, the middleware goes back to the /list page.
        app.post("/list", function (req,res) {
            let sqlquery = "UPDATE food SET name = ?, amount = ?, unit = ?, calories = ?, carbs = ?, fats = ?, protein = ?, salt = ?, sugar = ? WHERE id = ?"; 
            let updaterecord = [req.body.name, req.body.amount, req.body.unit, req.body.calories, req.body.carbs, req.body.fats, req.body.protein, req.body.salt, req.body.sugar, req.body.id]; //kcal because of input_name in addfood.html
            db.query(sqlquery, updaterecord, (err, result) => {
                if (err) {
                    var bool = false;
                    // res.redirect('back'); //go back to prev page with all the values
                    // renderListPageWithFailMessage(res, "Food update failed, please try again.");
                    renderListPageWithMessage(res, "Food update failed, please try again.", bool);
                }
                else{
                    // go back to list page
                    // renderListPageWithSuccessMessage(res, "Food updated successfully.");
                    var bool = true;
                    renderListPageWithMessage(res, "Food updated successfully.", bool);
                }
            }); 
        });
    
        // DESC: Render home page
        app.get("/",function(req, res){ 
            res.render("index.html")
        });
    
        // DESC: Render food list page
        app.get("/list", function(req,res){
            renderListPage(res);
        });
    
        // DESC: Delete food from database --> edit error part
        // When user clicks on delete button in /list, the selected checkboxes will pass in the food.id values
        // db then deletes the items based on the food.id
        // If successful, will redirect to /list and send back JSON object of success to print out success message in /list.
        app.get("/list-delete", function(req,res){ //use req.body.check
            // pass in checkbox value of food.id (checkbox name = check, value = <%=food.id&>)
            // concatenate because might have more than one ? value
            let sqlquery = "DELETE from food WHERE id in (" + req.query.check + ")";
            db.query(sqlquery, (err, result) => {
                if (err) {
                        return console.error(err.message);
                    }
                    else{
                        // go back to list page
                        var bool = true;
                        renderListPageWithMessage(res, "Food deleted successfully.", bool);
                    } 
            });
        });
    
        // DESC: Render search page
        app.get("/search",function(req, res) { 
            res.render("search.html", {success: null});
        }); 
    
        // DESC: Search for food in database --> edit error part
        // if the keyword entered by the user is valid and food is found, renders list page with the found food items, and an 
        // empty success JSON object to prevent any error message from popping up
        app.get("/search-result-db", function (req, res) {
            //searching in the database
            let searchInput = ['%' + req.query.name + '%']; //.name because of input_name in search.html
            let sqlquery = "SELECT * FROM food WHERE name like ?";
            // execute sql query 
            db.query(sqlquery, searchInput, (err, result) => {
                if (err) {
                    return console.error(err.message);
                }
                else{
                    res.render ('list.html',{availableFood: result, success: [] });
                } 
            });
        });
    
        //HELPER FUNCTIONS
        // render list page without app(req,res)
        function renderListPage(res){
            //query db to get all the books
            let sqlquery = "select * from food";
            //execute sqlquery
            db.query(sqlquery, (err, result) => {
                if(err) 
                    res.send("Cannot render list page.");
                else
                    res.render("list.html", {availableFood: result, success: [] });
            });
        }
    
        // render list page with MESSAGE without app(req,res)
        function renderListPageWithMessage(res, message, bool){
            let sqlquery = "select * from food";
            db.query(sqlquery, (err, result) => {
                if(err) 
                    res.send("Cannot render list page.");
                else
                    res.render("list.html", {availableFood: result, success: [bool, message]});
            });
        }
    
    }
    
    
    