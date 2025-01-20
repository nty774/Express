import express, { json } from "express";
const port = 3000;
const app = express();

app.use(json());

let memoryDB = [];
let id = 1;
// app.get("/", (req, res) => {
//   res.send("Welcome to our new coffee shop");
// });

//create new coffee menu  || CREATE
app.post("/", (req, res) => {
  const { name, price } = req.body;
  const newMenu = { id: id++, name, price };
  memoryDB.push(newMenu);

  res.status(201).send(newMenu);
  // console.log(req.body.name);
});

//get all menus || READ
app.get("/", (req, res) => {
  res.status(200).send(memoryDB);
});

//get all menus || READ
app.get("/:id", (req, res) => {
  const { id } = req.params;
  const menu = memoryDB.find((menu) => menu.id === parseInt(id));

  if (!menu) {
    return res.status(404).send("Menu not found");
  }

  res.status(200).send({ menu });
});

//update menu || UPDATE
app.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  const menu = memoryDB.find((m) => m.id === parseInt(id));
  if (!menu) {
    return res.status(404).send("Menu not found");
  }

  menu.name = name;
  menu.price = price;

  res.status(200).send(menu);
});

//delete menu || DELETE
app.delete("/:id", (req, res) => {
  const { id } = req.params;
  const menuIndex = memoryDB.findIndex((m) => m.id === parseInt(id));
  if (menuIndex === -1) {
    return res.status(404).send("Menu not found");
  }
  memoryDB.splice(menuIndex, 1);
  res.status(200).send("Menu deleted successfully");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
