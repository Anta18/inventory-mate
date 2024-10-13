// routes/items.js

const express = require("express");
const router = express.Router();
const Item = require("../models/items");
const Godown = require("../models/godown");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

// GET /items/list - Get distinct brands
router.get("/brands/list", auth, async (req, res) => {
  try {
    // Fetch all godowns owned by the user
    const godowns = await Godown.find({ owner: req.user._id }).select("_id");
    const godownIds = godowns.map((g) => g._id);

    // Fetch distinct brands from items in these godowns
    const brands = await Item.distinct("brand", {
      godown_id: { $in: godownIds },
    });

    res.json(brands);
  } catch (error) {
    console.error("Error fetching brands list:", error);
    res.status(500).json({ error: "Failed to fetch brands." });
  }
});

// GET /items/categories/list - Get distinct categories
router.get("/categories/list", auth, async (req, res) => {
  try {
    // Fetch all godowns owned by the user
    const godowns = await Godown.find({ owner: req.user._id }).select("_id");
    const godownIds = godowns.map((g) => g._id);

    // Fetch distinct categories from items in these godowns
    const categories = await Item.distinct("category", {
      godown_id: { $in: godownIds },
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories list:", error);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

// Utility function to build filter object
const buildFilter = async (query, userId) => {
  const filter = {};

  // If godown_id is provided, ensure it belongs to the user
  if (query.godown_id) {
    if (!mongoose.Types.ObjectId.isValid(query.godown_id)) {
      throw new Error("Invalid godown_id format.");
    }

    const godown = await Godown.findOne({
      _id: query.godown_id,
      owner: userId,
    });

    if (!godown) {
      throw new Error("Invalid godown_id or access denied.");
    }

    filter.godown_id = query.godown_id;
  } else {
    // If godown_id is not provided, fetch all godowns owned by the user
    const godowns = await Godown.find({ owner: userId }).select("_id");
    const godownIds = godowns.map((g) => g._id);
    filter.godown_id = { $in: godownIds };
  }

  return filter;
};

// Create a new Item with validation
router.post(
  "/",
  auth,
  [
    body("name").isString().trim().notEmpty().withMessage("Name is required."),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer."),
    body("category")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Category is required."),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number."),
    body("status")
      .optional()
      .isIn(["in_stock", "out_of_stock"])
      .withMessage("Status must be either 'in_stock' or 'out_of_stock'."),
    body("godown_id").isMongoId().withMessage("godown_id must be a valid ID."),
    body("brand")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Brand is required."),
    // Add more validators as needed
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        quantity,
        category,
        price,
        status,
        godown_id,
        brand,
        attributes,
        image_url,
      } = req.body;

      // Validate that the godown exists and belongs to the user
      const godown = await Godown.findOne({
        _id: godown_id,
        owner: req.user._id,
      });
      if (!godown) {
        return res.status(400).send({ error: "Invalid godown_id" });
      }

      const item = new Item({
        name,
        quantity,
        category,
        price,
        status: status || "in_stock",
        godown_id,
        brand,
        attributes,
        image_url,
      });

      await item.save();
      res.status(201).send(item);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

// Get all Items for the authenticated user with comprehensive filters
router.get("/", auth, async (req, res) => {
  try {
    const {
      category,
      status,
      search,
      minPrice,
      maxPrice,
      brand,
      attributes, // Assuming attributes can be filtered
      sortBy, // e.g., sortBy=price:asc or sortBy=name:desc
      limit = 20,
      skip = 0,
      godown_id,
    } = req.query;

    let filter = await buildFilter(req.query, req.user._id);

    // Apply additional filters
    if (category) {
      const categoryArray = Array.isArray(category)
        ? category
        : category.split(",");
      filter.category = { $in: categoryArray };
    }

    if (status) {
      const statusArray = Array.isArray(status) ? status : status.split(",");
      filter.status = { $in: statusArray };
    }

    if (brand) {
      const brandArray = Array.isArray(brand) ? brand : brand.split(",");
      filter.brand = { $in: brandArray };
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Filter based on attributes (assuming attributes is a JSON string)
    if (attributes) {
      try {
        const attrs = JSON.parse(attributes);
        Object.keys(attrs).forEach((key) => {
          filter[`attributes.${key}`] = attrs[key];
        });
      } catch (err) {
        return res.status(400).send({ error: "Invalid attributes format." });
      }
    }

    // Build the query
    let query = Item.find(filter).populate("godown_id");

    // Sorting
    if (sortBy) {
      const parts = sortBy.split(":");
      const sortField = parts[0];
      const sortOrder = parts[1] === "desc" ? -1 : 1;
      query = query.sort({ [sortField]: sortOrder });
    }

    // Pagination
    const limitNum = parseInt(limit);
    const skipNum = parseInt(skip);
    query = query.limit(limitNum).skip(skipNum);

    const items = await query.lean();
    res.send(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).send({ error: error.message });
  }
});

// GET /items/:id - Get a single Item by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const itemId = req.params.id;

    // Validate itemId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).send({ error: "Invalid Item ID format." });
    }

    const item = await Item.findById(itemId).populate("godown_id").lean();
    if (!item) {
      return res.status(404).send({ error: "Item not found" });
    }

    // Ensure the godown belongs to the user
    if (String(item.godown_id.owner) !== String(req.user._id)) {
      return res.status(403).send({ error: "Access denied" });
    }

    res.send(item);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update an Item with validation
router.patch(
  "/:id",
  auth,
  [
    body("name").optional().isString().trim().notEmpty(),
    body("quantity").optional().isInt({ min: 0 }),
    body("category").optional().isString().trim().notEmpty(),
    body("price").optional().isFloat({ min: 0 }),
    body("status")
      .optional()
      .isIn(["in_stock", "out_of_stock"])
      .withMessage("Status must be either 'in_stock' or 'out_of_stock'."),
    body("godown_id").optional().isMongoId(),
    body("brand").optional().isString().trim().notEmpty(),
    // Add more validators as needed
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "name",
      "quantity",
      "category",
      "price",
      "status",
      "godown_id",
      "brand",
      "attributes",
      "image_url",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
      const itemId = req.params.id;

      // Validate itemId
      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).send({ error: "Invalid Item ID format." });
      }

      const item = await Item.findById(itemId).populate("godown_id");
      if (!item) {
        return res.status(404).send({ error: "Item not found" });
      }

      // Ensure the godown belongs to the user
      if (String(item.godown_id.owner) !== String(req.user._id)) {
        return res.status(403).send({ error: "Access denied" });
      }

      // If godown_id is being updated, validate the new godown
      if (req.body.godown_id) {
        const newGodown = await Godown.findOne({
          _id: req.body.godown_id,
          owner: req.user._id,
        });
        if (!newGodown) {
          return res.status(400).send({ error: "Invalid new godown_id" });
        }
      }

      // Apply updates
      updates.forEach((update) => {
        item[update] = req.body[update];
      });

      await item.save();
      res.send(item);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

// DELETE /items/:id - Delete an Item
router.delete("/:id", auth, async (req, res) => {
  try {
    const itemId = req.params.id;

    // Validate itemId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).send({ error: "Invalid Item ID format." });
    }

    const item = await Item.findById(itemId).populate("godown_id").lean();

    if (!item) {
      return res.status(404).send({ error: "Item not found." });
    }

    // Ensure the godown belongs to the user
    if (String(item.godown_id.owner) !== String(req.user._id)) {
      return res.status(403).send({ error: "Access denied" });
    }

    await Item.deleteOne({ _id: itemId });

    res.send({ message: "Item deleted successfully", item });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Move an Item to another Godown
router.post(
  "/move",
  auth,
  [
    body("itemId").isMongoId().withMessage("Invalid itemId format."),
    body("toLocationId")
      .isMongoId()
      .withMessage("Invalid toLocationId format."),
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, toLocationId } = req.body;

    try {
      // Fetch the item
      const item = await Item.findById(itemId).populate("godown_id");
      if (!item) {
        return res.status(404).json({ message: "Item not found." });
      }

      // Fetch the destination godown
      const destinationGodown = await Godown.findById(toLocationId);
      if (!destinationGodown) {
        return res
          .status(404)
          .json({ message: "Destination godown not found." });
      }

      // Fetch the source godown (current location)
      const sourceGodown = await Godown.findById(item.godown_id);
      if (!sourceGodown) {
        return res.status(404).json({ message: "Source godown not found." });
      }

      // Check if the user owns both the source and destination godowns
      if (
        String(sourceGodown.owner) !== String(req.user._id) ||
        String(destinationGodown.owner) !== String(req.user._id)
      ) {
        return res
          .status(403)
          .json({ message: "You do not have permission to move this item." });
      }

      // Check if the destination godown is a subgodown (has no children)
      const destinationHasChildren = await Godown.exists({
        parent_godown: destinationGodown._id,
      });
      if (destinationHasChildren) {
        return res.status(400).json({
          message: "Items can only be moved to subgodowns with no children.",
        });
      }

      // Update the item's godown_id
      item.godown_id = destinationGodown._id;
      await item.save();

      // Populate the updated godown_id
      await item.populate("godown_id");

      return res.status(200).json({
        message: "Item moved successfully.",
        item,
      });
    } catch (error) {
      console.error("Error moving item:", error);
      return res.status(500).json({ message: "Server error." });
    }
  }
);

module.exports = router;
