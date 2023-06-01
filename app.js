//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/todoListDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todoList"
});

const item2 = new Item({
  name: "Hit this"
});

const item3 = new Item({
  name: "Cool"
})

const defaultItems = [item1, item2, item3];


const items = ["Buy Food", "Cook Food", "Eat Food"];

async function insertDefaultItems() {
  try {
    await Item.insertMany(defaultItems);
    console.log("All good");
  } catch (err) {
    console.log(err);
  }
}







const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();
  


  async function findItems(){
    try {
      const foundItems = await Item.find({});
      if (foundItems.length === 0){
        insertDefaultItems();
        res.redirect("/");
      } else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
      
    } catch (err) {
      console.log(err);
    }
  }
  
  findItems()

});

app.post("/", async(req, res) =>{

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }

  else{
    try{
      const foundList = await List.findOne({name: listName})
      if(foundList){
        // listname items parameter holds list of items
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    }
    catch(err){
      console.log(err);
      res.status(500).send("Error finding list"); 
    }
  }

  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({ name: customListName });

    if (foundList) {
      // List already exists
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    } else {
      // Create a new list with default items
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      await list.save();
      // Handle any further operations after saving the list if needed
      res.redirect("/" + customListName);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating or finding list."); // Handle error response
  }
});


app.get("/about", function(req, res){
  res.render("about");
});


app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


  if (listName=== "Today"){
    try {
      await Item.findByIdAndDelete(checkedItemId);
      res.redirect("/"); // Redirect to a home after successful deletion
    } catch (err) {
      console.log(err);
      res.status(500).send("Error deleting item."); // Handle error response
    }
  }

  else{
    try{
      const foundList = await List.findOneAndUpdate({name: listName}, {$pull:{items: {_id: checkedItemId}}});
      res.redirect("/" + listName);
    }
    catch(err){
      console.log(err);

    }
  }

 
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
