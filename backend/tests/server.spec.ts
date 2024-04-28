import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { request } from "undici";
import FormData from "form-data";
import { CsvData } from "../src/types";

test("upload without file", async ({ page }) => {
  const response = await request("http://localhost:3000/api/files", {
    method: "POST",
  });

  const jsonResponse = (await response.body.json()) as { message: string };
  expect(jsonResponse.message).toEqual("The file 'file' is required");
  expect(response.statusCode).toEqual(500);
});

test("upload with multiple files", async ({ page }) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream("tests-files/data.csv"));
  formData.append("file", fs.createReadStream("tests-files/data.csv"));
  const headers = formData.getHeaders();

  const response = await request("http://localhost:3000/api/files", {
    method: "POST",
    headers,
    body: formData,
  });
  const jsonResponse = (await response.body.json()) as { message: string };
  expect(jsonResponse.message).toEqual("There must be only one file");
  expect(response.statusCode).toEqual(500);
});

test("upload with different extension than csv", async ({ page }) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream("tests-files/data.txt"));
  const headers = formData.getHeaders();

  const response = await request("http://localhost:3000/api/files", {
    method: "POST",
    headers,
    body: formData,
  });

  const jsonResponse = (await response.body.json()) as { message: string };
  expect(jsonResponse.message).toEqual(
    "The file must be a .csv extension file"
  );
  expect(response.statusCode).toEqual(500);
});

test("upload with csv file with wrong structure", async ({ page }) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream("tests-files/error.csv"));
  const headers = formData.getHeaders();

  const response = await request("http://localhost:3000/api/files", {
    method: "POST",
    headers,
    body: formData,
  });

  const jsonResponse = (await response.body.json()) as { message: string };
  expect(jsonResponse.message).toEqual(
    "The file could not be loaded, check the file structure: id, name, email"
  );

  expect(response.statusCode).toEqual(500);
});

test("upload with correct file", async ({ page }) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream("tests-files/data.csv"));
  const headers = formData.getHeaders();

  const response = await request("http://localhost:3000/api/files", {
    method: "POST",
    headers,
    body: formData,
  });

  const jsonResponse = (await response.body.json()) as { message: string };
  expect(jsonResponse.message).toEqual("File successful loaded");

  expect(response.statusCode).toEqual(200);
});

test("search without q", async ({ page }) => {
  const response = await request("http://localhost:3000/api/users", {
    method: "GET",
  });

  const jsonResponse = (await response.body.json()) as { message: string };
  expect(jsonResponse.message).toEqual("The parameter 'q' is required");

  expect(response.statusCode).toEqual(500);
});

test("search with empty q", async ({ page }) => {
  const response = await request("http://localhost:3000/api/users?q=", {
    method: "GET",
  });

  const { data } = (await response.body.json()) as { data: CsvData[] };
  expect(data.length).toEqual(5);
  expect(response.statusCode).toEqual(200);
});

test("search with q without match", async ({ page }) => {
  const response = await request("http://localhost:3000/api/users?q=exanple", {
    method: "GET",
  });

  const jsonResponse = (await response.body.json()) as { message: string };
  expect(jsonResponse.message).toEqual("There were no results for exanple");
  expect(response.statusCode).toEqual(500);
});

test("search with q value with match", async ({ page }) => {
  const response = await request("http://localhost:3000/api/users?q=Jane", {
    method: "GET",
  });

  const { data } = (await response.body.json()) as { data: CsvData[] };

  const includesJane = data.every((item) =>
    Object.values(item).some((value) => value.includes("Jane"))
  );

  expect(includesJane).toEqual(true);
  expect(response.statusCode).toEqual(200);
});
