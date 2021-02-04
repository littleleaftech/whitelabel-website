const { db } = require("../config/admin-config");
const {
  authErrorHandler,
} = require("../utils/errorHandlers/auth-error-handler");
const { contentBuilder } = require("../utils/helpers/content-builder");
const { contentValidation } = require("../utils/helpers/content-validation");
const { getAll, deleteItem } = require("./shared-crud-calls");

exports.addContent = async (req, res) => {
  const { heading, content } = req.body;
  const { page, section } = req.params;

  // build content
  const newContent = contentBuilder(heading, content, section);

  // validation section
  const isValid = contentValidation(page, section, req, res);
  if (!isValid) return;

  // add content
  try {
    const contentRef = await db.collection(`${page}`).doc(`${section}`);
    const doc = await contentRef.get();

    if (!doc.exists) {
      await db.collection(`${page}`).doc(`${section}`).set(newContent);

      res
        .status(201)
        .json({ message: `New content added to ${page} ${section}` });
    } else {
      res.status(400).json({
        message: `This content already exists for ${page} ${section}`,
      });
    }
  } catch (error) {
    const errorMessage = authErrorHandler(error.code);
    const { status, message } = errorMessage;

    res.status(status).json({ error: message });
  }
};

exports.getContent = async (req, res) => {
  const { page } = req.query;

  if (!page) {
    return res
      .status(400)
      .json({ message: "Something went wrong while trying to get content" });
  }

  getAll(req, res);
};

exports.updateContent = async (req, res) => {
  const { heading, content } = req.body;
  const { page, section } = req.params;

  // build content
  const newContent = contentBuilder(heading, content, section);

  // validation
  contentValidation(page, section, req, res);

  try {
    const contentRef = await db.collection(`${page}`).doc(`${section}`);
    const doc = await contentRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: `The document does not exist` });
    } else {
      await db.collection(`${page}`).doc(`${section}`).set(newContent);
      res.status(201).json({
        message: `Content has been updated for ${section} on ${page} page`,
      });
    }
  } catch (error) {
    res.send({ error });
  }
};

exports.deleteContent = async (req, res) => {
  deleteItem(req, res);
};
