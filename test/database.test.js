import assert from "node:assert";
import { beforeEach, test } from "node:test";
import { Database } from "../src/database.js"; // Use um caminho relativo correto
import fs from "node:fs/promises";

let database;

beforeEach(() => {
  fs.readFile = async () => JSON.stringify({ users: [] });
  database = new Database();
});

test("should initialize with an empty database", async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  assert.deepStrictEqual(await database.select("users"), []);
});

test("should insert data into the specified table", async () => {
  const userData = { id: 1, name: "John Doe" };
  const insertedData = database.insert("users", userData);

  assert.deepStrictEqual(insertedData, userData);
  assert.deepStrictEqual(await database.select("users"), [userData]);
});

test("should select all data from a table without filter", async () => {
  const userData1 = { id: 1, name: "John Doe" };
  const userData2 = { id: 2, name: "Jane Smith" };

  database.insert("users", userData1);
  database.insert("users", userData2);

  const users = await database.select("users");

  assert.deepStrictEqual(users, [userData1, userData2]);
});

test("should select filtered data from a table based on search criteria", async () => {
  const userData1 = { id: 1, name: "John Doe" };
  const userData2 = { id: 2, name: "Jane Smith" };

  database.insert("users", userData1);
  database.insert("users", userData2);

  const users = await database.select("users", { name: "John" });

  assert.deepStrictEqual(users, [userData1]);
});

test("should update a row in the specified table", async () => {
  const userData = { id: 1, name: "John Doe" };
  database.insert("users", userData);

  const updatedData = { name: "Johnathan Doe" };
  database.update("users", 1, updatedData);

  const users = await database.select("users");

  assert.deepStrictEqual(users, [{ id: 1, name: "Johnathan Doe" }]);
});

test("should delete a row from the specified table", async () => {
  const userData = { id: 1, name: "John Doe" };
  database.insert("users", userData);

  database.delete("users", 1);

  const users = await database.select("users");

  assert.deepStrictEqual(users, []);
});

test("should create a new table when inserting into a non-existing table", async () => {
  const userData = { id: 1, name: "John Doe" };
  database.insert("new_table", userData);

  const newTableData = await database.select("new_table");

  assert.deepStrictEqual(newTableData, [userData]);
});

test("should not update when the row with the specified id does not exist", async () => {
  const userData = { id: 1, name: "John Doe" };
  database.insert("users", userData);

  const updatedData = { name: "Johnathan Doe" };
  database.update("users", 999, updatedData); // ID 999 doesn't exist

  const users = await database.select("users");

  assert.deepStrictEqual(users, [userData]); // Data should remain unchanged
});

test("should not delete when the row with the specified id does not exist", async () => {
  const userData = { id: 1, name: "John Doe" };
  database.insert("users", userData);

  database.delete("users", 999); // ID 999 doesn't exist

  const users = await database.select("users");

  assert.deepStrictEqual(users, [userData]); // Data should remain unchanged
});
