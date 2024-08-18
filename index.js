import chalk from "chalk";
import { input, confirm, select } from "@inquirer/prompts";
import fs from "fs";

const createModel = (modelName, fields) => {
    let fieldsContent = "";

    fields.forEach((field) => {
        fieldsContent += `  ${field.name}: { type: ${field.type}, required: true },\n`;
    });

    const content = `const mongoose = require('mongoose');

  const ${modelName}Schema = mongoose.Schema({
  ${fieldsContent}});

  module.exports = mongoose.model('${modelName}', ${modelName}Schema);`;

    fs.writeFileSync(`models/${modelName}.js`, content);
    console.log(chalk.green(`Modèle ${modelName} created successfully!`));
};

const createController = (modelName) => {
    const content = `const ${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    } = require('../models/${modelName}');

  exports.get${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    } = async (req, res, next) => {
    try {
      const ${modelName.toLowerCase()} = await ${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }.find({});
      res.status(200).json(${modelName.toLowerCase()});
    } catch (error) {
      next({ message: error.message, service: '${modelName}/get${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }' });
    }
  };

  exports.post${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    } = async (req, res, next) => {
    try {
      const ${modelName.toLowerCase()} = await ${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }.create(req.body);
      res.status(201).json(${modelName.toLowerCase()});
    } catch (error) {
      next({ message: error.message, service: '${modelName}/post${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }' });
    }
  };

  exports.delete${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    } = async (req, res, next) => {
    try {
      const { id } = req.params;
      const ${modelName.toLowerCase()} = await ${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }.findByIdAndDelete(id);
      if (!${modelName.toLowerCase()}) {
        return res.status(404).json({ message: "can't find id" });
      }
      const update${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    } = await ${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }.findById(id);
      res.status(200).json(update${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    });
    } catch (error) {
      console.log(error);
      next({ message: error.message });
    }
  };

  exports.get${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }ById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const ${modelName.toLowerCase()} = await ${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }.findById(id);
      if (!${modelName.toLowerCase()}) {
        return res.status(404).json({ message: "can't find id" });
      }
      res.status(200).json(${modelName.toLowerCase()});
    } catch (error) {
      console.log(error);
      next({ message: error.message });
    }
  };

  exports.update${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }ById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const ${modelName.toLowerCase()} = await ${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }.findByIdAndUpdate(id, req.body);
      if (!${modelName.toLowerCase()}) {
        return res.status(404).json({ message: "can't find id" });
      }
      const update${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    } = await ${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }.findById(id);
      res.status(200).json(update${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    });
    } catch (error) {
      console.log(error);
      next({ message: error.message });
    }
  };`;

    fs.writeFileSync(`controllers/${modelName}Controller.js`, content);
    console.log(chalk.green(`Contrôleur ${modelName} created successfully!`));
};

const createRoute = (modelName) => {
    const content = `const express = require('express');
  const router = express.Router();

  const ${modelName}Ctrl = require('../controllers/${modelName}Controller');

  router.get('/${modelName}', ${modelName}Ctrl.get${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    });
  router.post('/${modelName}', ${modelName}Ctrl.post${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    });
  router.delete('/${modelName}/:id', ${modelName}Ctrl.delete${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    });
  router.get('/${modelName}/:id', ${modelName}Ctrl.get${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }ById);
  router.put('/${modelName}/:id', ${modelName}Ctrl.update${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
    }ById);

  module.exports = router;`;

    if (!fs.existsSync("routes")) {
        fs.mkdirSync("routes");
    }

    fs.writeFileSync(`routes/${modelName}Routes.js`, content);
    console.log(chalk.green(`Route ${modelName} created successfully!`));
};

const createOrUpdateServer = (modelName) => {
    const serverFile = "server.js";
    let content;

    if (fs.existsSync(serverFile)) {
        content = fs.readFileSync(serverFile, "utf8");

        // Add new route import
        const importStatement = `const ${modelName}Route = require('./routes/${modelName}Routes');\n`;
        if (!content.includes(importStatement)) {
            const lastImportIndex = content.lastIndexOf("\n", content.indexOf("const ", content.indexOf("require")));
            content = content.slice(0, lastImportIndex + 1) + importStatement + content.slice(lastImportIndex + 1);
        }

        // Add new app.use
        const appUseStatement = `app.use("/api", ${modelName}Route);\n`;
        const appUseInsertPosition = content.indexOf("\n", content.indexOf("app.use(express.urlencoded"));
        if (!content.includes(appUseStatement)) {
            content = content.slice(0, appUseInsertPosition + 1) + appUseStatement + content.slice(appUseInsertPosition + 1);
        }
    } else {
        content = `require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const express = require("express");

// import des routes
const ${modelName}Route = require('./routes/${modelName}Routes');

const app = express();

const MONGO_URL = 'your-mongodb-url';
const PORT = 'your PORT';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", ${modelName}Route);

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
  })
);

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server connected to MongoDB on port " + PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });`;
    }

    fs.writeFileSync(serverFile, content);
    console.log(chalk.green(`Server.js file updated successfully!`));
};


const askForFields = async () => {
    const fields = [];
    let addMore = true;

    while (addMore) {
        const name = await input({ message: "Enter the field name:" });
        const type = await select({
            message: "Choose the field type:",
            choices: [
                { name: "String", value: "String" },
                { name: "Number", value: "Number" },
                { name: "Date", value: "Date" },
                { name: "Boolean", value: "Boolean" },
                { name: "Array", value: "Array" },
                { name: "Object", value: "Object" },
            ],
        });

        fields.push({ name, type });
        addMore = await confirm({ message: "Do you want to add another field?" });
    }

    return fields;
};

const init = async () => {
    const modelName = await input({ message: "Enter the model name:" });

    if (!fs.existsSync("models")) {
        fs.mkdirSync("models");
    }
    if (!fs.existsSync("controllers")) {
        fs.mkdirSync("controllers");
    }
    if (!fs.existsSync("routes")) {
        fs.mkdirSync("routes");
    }

    const fields = await askForFields();
    createModel(modelName, fields);
    createController(modelName);
    createRoute(modelName);

    if (fs.existsSync("server.js")) {
        createOrUpdateServer(modelName);
    } else {
        const wantServer = await confirm({ message: "Do you want to generate a server.js file?" });
        if (wantServer) {
            createOrUpdateServer(modelName);
        }
    }
};

init();