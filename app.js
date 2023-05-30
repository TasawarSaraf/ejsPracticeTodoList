const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

// Parse JSON bodies
app.use(bodyParser.json());

app.set('view engine', 'ejs');

let todoList = []

let workList = []

// Define your routes
app.get('/', (req, res) => {

  let today = new Date();

  let options = {
      weekday: "long",
      day: "numeric",
      month: "long"
  }

  let day = today.toLocaleDateString("en-US", options);

  res.render("list", {listTitle: day, todoList: todoList})
});


// POST route for adding a new item to the list
app.post('/', (req, res) => {
    let newItem = req.body.todoItem;

    if(req.body.list === "Work List"){
        workList.push(newItem)
        res.redirect("/work");

    } else{
        todoList.push(newItem)
        res.redirect('/');
    }
});


app.get("/work", (req,res)=>{
    res.render("list", {listTitle: "Work List", todoList: workList})
})

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});