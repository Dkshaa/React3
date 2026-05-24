const fs = require("fs");
const path = require("path");

const root = process.cwd();
const requiredFiles = ["index.html", "src/app.js", "src/styles.css", "README.md", "package.json"];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const app = fs.readFileSync(path.join(root, "src/app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

[
  "React.useState",
  "localStorage",
  "addTodo",
  "toggleTodo",
  "deleteTodo",
  "clearCompleted",
  "ReactDOM.createRoot",
].forEach((token) => {
  if (!app.includes(token)) {
    throw new Error(`Expected app.js to include ${token}`);
  }
});

["react.development.js", "react-dom.development.js", "src/app.js"].forEach((token) => {
  if (!html.includes(token)) {
    throw new Error(`Expected index.html to include ${token}`);
  }
});

console.log("Project check passed.");
