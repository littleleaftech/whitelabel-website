const { admin, db } = require("../config/admin-config");

exports.getAll = async (req, res) => {
  const { page } = req.query;
  let content = !page ? req.url.split("/")[1] : page;
  let items = [];

  try {
    const contentRef = await db.collection(`${content}`);
    const allContent = await contentRef.get();

    if (allContent.size === 0) {
      return res.status(400).json({
        message: `Content for ${content} does not exist or there are no items`,
      });
    } else {
      allContent.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      return res.status(200).json(items);
    }
  } catch (error) {
    res.send({ error });
  }
};

exports.deleteItem = async (req, res) => {
  const { section, name, area, page } = req.params;
  let collection = !page ? req.url.split("/")[1] : page;
  let item = section ? section : name ? name : area;

  try {
    const contentRef = await db.collection(collection).doc(item);
    const doc = await contentRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: "This content does not exist" });
    } else {
      await db.collection(collection).doc(item).delete();

      if (collection == "image") return;

      return res
        .status(200)
        .json({ message: "This content has now been deleted", item });
    }
  } catch (error) {
    res.send({ error });
  }
};
