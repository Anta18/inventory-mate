// routes/items.js
const express = require("express");
const router = express.Router();
const Item = require("../models/items"); // Corrected path
const Godown = require("../models/godown"); // Corrected path
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Utility function to build filter object
const buildFilter = (query, userId) => {
  const filter = {};

  // If godown_id is provided, ensure it belongs to the user
  if (query.godown_id) {
    if (mongoose.Types.ObjectId.isValid(query.godown_id)) {
      filter.godown_id = query.godown_id;
    } else {
      throw new Error("Invalid godown_id format.");
    }
  } else {
    // If godown_id is not provided, fetch all godowns owned by the user
    // and include items from these godowns
    return Godown.find({ owner: userId })
      .select("_id")
      .then((godowns) => {
        const godownIds = godowns.map((g) => g._id);
        filter.godown_id = { $in: godownIds };
        return filter;
      });
  }

  return Promise.resolve(filter);
};

// Create a new Item
router.post("/", auth, async (req, res) => {
  // Corrected path
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
});

// Get all Items for the authenticated user with comprehensive filters
router.get("/", auth, async (req, res) => {
  // Corrected path
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
    } = req.query;

    let filter = {};

    // Build the filter based on query parameters
    try {
      filter = await buildFilter(req.query, req.user._id);
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }

    // Apply additional filters
    if (category) {
      filter.category = { $in: category.split(",") }; // Support multiple categories
    }

    if (status) {
      filter.status = status;
    }

    if (brand) {
      filter.brand = { $in: brand.split(",") }; // Support multiple brands
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

    const items = await query.exec();
    res.send(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).send({ error: error.message });
  }
});

// Get a single Item by ID
router.get("/:id", auth, async (req, res) => {
  // Corrected path
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

    res.send(item);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update an Item
router.patch("/:id", auth, async (req, res) => {
  // Corrected path
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
      if (!mongoose.Types.ObjectId.isValid(req.body.godown_id)) {
        return res.status(400).send({ error: "Invalid new godown_id format." });
      }

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
});

// Delete an Item
router.delete("/:id", auth, async (req, res) => {
  // Corrected path
  try {
    const itemId = req.params.id;

    // Validate itemId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).send({ error: "Invalid Item ID format." });
    }

    const item = await Item.findById(itemId).populate("godown_id");

    if (!item) {
      return res.status(404).send({ error: "Item not found." });
    }

    // Ensure the godown belongs to the user
    if (String(item.godown_id.owner) !== String(req.user._id)) {
      return res.status(403).send({ error: "Access denied" });
    }

    await item.remove();
    res.send({ message: "Item deleted successfully", item });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Move an Item to another Godown
router.post("/move", auth, async (req, res) => {
  // Corrected path
  const { itemId, toLocationId } = req.body;

  // Basic validation
  if (!itemId || !toLocationId) {
    return res
      .status(400)
      .json({ message: "itemId and toLocationId are required." });
  }

  // Validate ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(itemId) ||
    !mongoose.Types.ObjectId.isValid(toLocationId)
  ) {
    return res.status(400).json({ message: "Invalid itemId or toLocationId." });
  }

  try {
    // Fetch the item
    const item = await Item.findById(itemId).populate("godown_id");
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Fetch the destination godown
    const destinationGodown = await Godown.findById(toLocationId);
    if (!destinationGodown) {
      return res.status(404).json({ message: "Destination godown not found." });
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
});

module.exports = router;
