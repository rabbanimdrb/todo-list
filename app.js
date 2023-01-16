const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
//   useNewUrlParser: true,
// });

mongoose.connect("mongodb+srv://admin-rabbani:test123@cluster0.xhj9cti.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});





const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const sugar = new Item({
  name: "Sugar",
});

const salt = new Item({
  name: "Salt",
});

const water = new Item({
  name: "Water",
});

const arrItems = [sugar, salt, water];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    // if(err){
    //     console.log(err);
    // }else{
    //     console.log(foundItems);
    // }

    if (foundItems.length === 0) {
      Item.insertMany(arrItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Items added succesfully to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

  // let day = date.getDate();
});

app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully deleted checked items ");
          res.redirect("/");
        }
      });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}},function(err, foundList){
        if (!err) {
            res.redirect("/" + listName);
        }
    });
  }

  
});

// app.get("/work", function(req, res){
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: arrItems,
        });

        list.save();
        res.redirect("/" + customListName);

        // console.log("Doesn't exist!");
      } else {
        // Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
        // console.log("Exists!");
      }
    }
  });
});

app.post("/work", function (req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server is up and running on port 3000");
});
