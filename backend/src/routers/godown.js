// routes/godowns.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Godown = require("../models/godown");
const Item = require("../models/items");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Create a new Godown with validation
router.post(
  "/",
  auth,
  [
    body("name").isString().trim().notEmpty().withMessage("Name is required."),
    body("parent_godown")
      .optional()
      .isMongoId()
      .withMessage("parent_godown must be a valid Godown ID."),
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { _id, name, parent_godown } = req.body;

      // If user provides a custom _id, validate its uniqueness and format
      if (_id) {
        // Ensure _id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(_id)) {
          return res.status(400).send({ error: "Invalid Godown ID format." });
        }

        // Check if _id already exists
        const existingGodown = await Godown.findById(_id);
        if (existingGodown) {
          return res.status(400).send({ error: "Godown ID already exists." });
        }
      }

      // Validate parent_godown if provided
      if (parent_godown) {
        const parentGodown = await Godown.findOne({
          _id: parent_godown,
          owner: req.user._id,
        });
        if (!parentGodown) {
          return res.status(400).send({ error: "Invalid parent_godown ID." });
        }

        // Prevent setting parent_godown to itself if _id is provided
        if (_id && String(parent_godown) === String(_id)) {
          return res
            .status(400)
            .send({ error: "Godown cannot be its own parent." });
        }
      }

      // Create new Godown
      const godown = new Godown({
        _id: _id || undefined,
        name,
        parent_godown: parent_godown || null,
        owner: req.user._id,
      });

      await godown.save();
      res.status(201).send(godown);
    } catch (error) {
      console.error("Error creating godown:", error);
      res.status(400).send({ error: error.message });
    }
  }
);

router.get("/filtered", auth, async (req, res) => {
  try {
    const {
      godown,
      subgodown,
      status,
      category,
      brand,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      search,
    } = req.query;

    // Initialize item filter excluding 'godown_id'
    let itemFilter = {};

    // Apply status filter
    if (status) {
      const statusArray = Array.isArray(status) ? status : status.split(",");
      itemFilter.status = { $in: statusArray };
    }

    // Apply category filter
    if (category) {
      const categoryArray = Array.isArray(category)
        ? category
        : category.split(",");
      itemFilter.category = { $in: categoryArray };
    }

    // Apply brand filter
    if (brand) {
      const brandArray = Array.isArray(brand) ? brand : brand.split(",");
      itemFilter.brand = { $in: brandArray };
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      itemFilter.price = {};
      if (minPrice) itemFilter.price.$gte = parseFloat(minPrice);
      if (maxPrice) itemFilter.price.$lte = parseFloat(maxPrice);
    }

    // Apply quantity range filter
    if (minQuantity || maxQuantity) {
      itemFilter.quantity = {};
      if (minQuantity) itemFilter.quantity.$gte = parseInt(minQuantity, 10);
      if (maxQuantity) itemFilter.quantity.$lte = parseInt(maxQuantity, 10);
    }

    // Apply search filter on item name
    if (search) {
      itemFilter.name = { $regex: search, $options: "i" };
    }

    // Initialize godownIds array and specificGodownId
    let godownIds = [];
    let specificGodownId = null;

    // Handle godown filter
    if (godown) {
      if (!mongoose.Types.ObjectId.isValid(godown)) {
        return res.status(400).send({ error: "Invalid Godown ID format." });
      }

      const selectedGodown = await Godown.findOne({
        _id: godown,
        owner: req.user._id,
      });

      if (!selectedGodown) {
        return res
          .status(400)
          .send({ error: "Godown not found or access denied." });
      }

      godownIds.push(selectedGodown._id);
      specificGodownId = selectedGodown._id; // Mark the selected godown for item filtering
    }

    // Handle subgodown filter
    if (subgodown) {
      if (!mongoose.Types.ObjectId.isValid(subgodown)) {
        return res.status(400).send({ error: "Invalid SubGodown ID format." });
      }

      const selectedSubGodown = await Godown.findOne({
        _id: subgodown,
        owner: req.user._id,
      });

      if (!selectedSubGodown) {
        return res
          .status(400)
          .send({ error: "SubGodown not found or access denied." });
      }

      godownIds.push(selectedSubGodown._id);
      specificGodownId = selectedSubGodown._id; // Set subgodown as the specific godown
    }

    // Fetch items based on godown and subgodown filtering
    async function getItemsForGodown(godownId) {
      const finalItemFilter = { ...itemFilter, godown_id: godownId };
      const items = await Item.find(finalItemFilter)
        .select(
          "_id name quantity category brand price status image_url attributes"
        )
        .lean();
      return items;
    }

    if (specificGodownId) {
      // If a specific godown or subgodown is mentioned, fetch items only for that godown
      const items = await getItemsForGodown(specificGodownId);

      if (godown) {
        // If godown is mentioned, also fetch its subgodowns
        const subGodowns = await Godown.find({
          parent_godown: specificGodownId,
        }).lean();

        const subGodownsData = await Promise.all(
          subGodowns.map(async (subGodown) => ({
            _id: subGodown._id,
            name: subGodown.name,
            items: await getItemsForGodown(subGodown._id),
            subGodowns: [], // Since subgodowns don’t have further subgodowns
          }))
        );

        return res.json([
          {
            _id: specificGodownId,
            name: (await Godown.findById(specificGodownId)).name,
            items,
            subGodowns: subGodownsData,
          },
        ]);
      } else {
        // If subgodown is mentioned, return only the subgodown and its items
        return res.json([
          {
            _id: specificGodownId,
            name: (await Godown.findById(specificGodownId)).name,
            items,
            subGodowns: [],
          },
        ]);
      }
    }

    // If no godown or subgodown is specified, return all top-level godowns
    const topLevelGodowns = await Godown.find({
      owner: req.user._id,
      parent_godown: null,
    }).lean();

    const godownsWithFilteredItems = await Promise.all(
      topLevelGodowns.map(async (godown) => ({
        _id: godown._id,
        name: godown.name,
        subGodowns: await Promise.all(
          (
            await Godown.find({ parent_godown: godown._id }).lean()
          ).map(async (subGodown) => ({
            _id: subGodown._id,
            name: subGodown.name,
            items: await getItemsForGodown(subGodown._id),
            subGodowns: [], // No subgodowns for these subGodowns
          }))
        ),
      }))
    );

    res.json(godownsWithFilteredItems);
  } catch (error) {
    console.error("Error fetching filtered godowns:", error);
    res.status(500).json({
      message: "Error fetching filtered godowns",
      error: error.message,
    });
  }
});

// Delete a Godown with cascade
router.delete("/:id", auth, async (req, res) => {
  try {
    const godownId = req.params.id;

    // Validate godownId
    if (!mongoose.Types.ObjectId.isValid(godownId)) {
      return res.status(400).send({ error: "Invalid Godown ID format." });
    }

    const godown = await Godown.findOne({
      _id: godownId,
      owner: req.user._id,
    });

    if (!godown) {
      return res.status(404).send({ error: "Godown not found." });
    }

    await godown.remove(); // Triggers pre 'remove' middleware for cascading deletes

    res.send({ message: "Godown deleted successfully.", godown });
  } catch (error) {
    console.error("Error deleting godown:", error);
    res.status(500).send({ error: error.message });
  }
});

router.get("/options", auth, async (req, res) => {
  try {
    const { godown, subgodown, brand, category } = req.query;

    // Initialize query filters with owner
    let itemQuery = {};

    if (subgodown) {
      // Validate subgodown ID
      if (!mongoose.Types.ObjectId.isValid(subgodown)) {
        console.log("Invalid SubGodown ID:", subgodown);
        return res.status(400).send({ error: "Invalid SubGodown ID format." });
      }

      // Convert subgodown to ObjectId
      const subgodownId = new mongoose.Types.ObjectId(subgodown);

      // Verify subgodown ownership
      const selectedSubGodown = await Godown.findOne({
        _id: subgodownId,
        owner: req.user._id,
      });

      if (!selectedSubGodown) {
        console.log("SubGodown not found or access denied:", subgodown);
        return res
          .status(404)
          .send({ error: "SubGodown not found or access denied." });
      }

      // Assign godown_id to subgodown as ObjectId
      itemQuery.godown_id = subgodownId;
    } else if (godown) {
      // Validate godown ID
      if (!mongoose.Types.ObjectId.isValid(godown)) {
        console.log("Invalid Godown ID:", godown);
        return res.status(400).send({ error: "Invalid Godown ID format." });
      }

      // Convert godown to ObjectId
      const godownId = new mongoose.Types.ObjectId(godown);

      // Verify godown ownership
      const selectedGodown = await Godown.findOne({
        _id: godownId,
        owner: req.user._id,
      });

      if (!selectedGodown) {
        console.log("Godown not found or access denied:", godown);
        return res
          .status(404)
          .send({ error: "Godown not found or access denied." });
      }

      // Fetch subgodowns under the selected godown
      const subgodowns = await Godown.find({ parent_godown: godownId }).select(
        "_id"
      );
      const godownIds = [godownId, ...subgodowns.map((g) => g._id)];

      // Assign godown_id with $in operator as ObjectIds
      itemQuery.godown_id = { $in: godownIds };
    }

    // Apply additional filters if present
    if (brand) {
      itemQuery.brand = brand;
    }
    if (category) {
      itemQuery.category = category;
    }

    // Fetch distinct brands and categories based on the itemQuery
    const [availableBrands, availableCategories] = await Promise.all([
      Item.distinct("brand", itemQuery),
      Item.distinct("category", itemQuery),
    ]);

    res.json({
      brands: availableBrands,
      categories: availableCategories,
    });
  } catch (error) {
    console.error("Error in /options endpoint:", error);
    res.status(500).json({ error: "Failed to fetch filter options." });
  }
});

// Get a single Godown by ID
router.get("search/:id", auth, async (req, res) => {
  try {
    const godownId = req.params.id;

    // Validate godownId
    if (!mongoose.Types.ObjectId.isValid(godownId)) {
      return res.status(400).send({ error: "Invalid Godown ID format." });
    }

    const godown = await Godown.findOne({
      _id: godownId,
      owner: req.user._id,
    })
      .populate({
        path: "subGodowns",
        populate: {
          path: "subGodowns items",
        },
      })
      .populate("items");

    if (!godown) {
      return res.status(404).send({ error: "Godown not found." });
    }

    res.send(godown);
  } catch (error) {
    console.error("Error fetching godown:", error);
    res.status(500).send({ error: error.message });
  }
});

// Update a Godown
router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "parent_godown"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const godownId = req.params.id;

    // Validate godownId
    if (!mongoose.Types.ObjectId.isValid(godownId)) {
      return res.status(400).send({ error: "Invalid Godown ID format." });
    }

    const godown = await Godown.findOne({
      _id: godownId,
      owner: req.user._id,
    });

    if (!godown) {
      return res.status(404).send({ error: "Godown not found." });
    }

    // If updating parent_godown, validate it
    if (req.body.parent_godown) {
      if (!mongoose.Types.ObjectId.isValid(req.body.parent_godown)) {
        return res
          .status(400)
          .send({ error: "Invalid parent_godown ID format." });
      }

      const parentGodown = await Godown.findOne({
        _id: req.body.parent_godown,
        owner: req.user._id,
      });
      if (!parentGodown) {
        return res.status(400).send({ error: "Invalid parent_godown ID." });
      }

      // Prevent setting parent_godown to itself
      if (String(req.body.parent_godown) === String(godownId)) {
        return res
          .status(400)
          .send({ error: "Godown cannot be its own parent." });
      }
    }

    // Apply updates
    updates.forEach((update) => {
      godown[update] = req.body[update];
    });

    await godown.save();
    res.send(godown);
  } catch (error) {
    console.error("Error updating godown:", error);
    res.status(400).send({ error: error.message });
  }
});

// Delete a Godown
router.delete("/:id", auth, async (req, res) => {
  try {
    const godownId = req.params.id;

    // Validate godownId
    if (!mongoose.Types.ObjectId.isValid(godownId)) {
      return res.status(400).send({ error: "Invalid Godown ID format." });
    }

    const godown = await Godown.findOne({
      _id: godownId,
      owner: req.user._id,
    });

    if (!godown) {
      return res.status(404).send({ error: "Godown not found." });
    }

    await godown.remove(); // Triggers pre 'remove' middleware for cascading deletes

    res.send({ message: "Godown deleted successfully.", godown });
  } catch (error) {
    console.error("Error deleting godown:", error);
    res.status(500).send({ error: error.message });
  }
});

router.get("/list", auth, async (req, res) => {
  try {
    const { parent_godown } = req.query;
    const filter = { owner: req.user._id };

    if (parent_godown) {
      // Validate parent_godown ID
      if (!mongoose.Types.ObjectId.isValid(parent_godown)) {
        return res.status(400).json({ error: "Invalid Parent Godown ID." });
      }

      // Ensure the parent_godown belongs to the user
      const parentGodown = await Godown.findOne({
        _id: parent_godown,
        owner: req.user._id,
      });

      if (!parentGodown) {
        return res
          .status(404)
          .json({ error: "Parent Godown not found or access denied." });
      }

      // Filter subgodowns with the specified parent_godown
      filter.parent_godown = parent_godown;
    } else {
      // For top-level godowns, parent_godown is null
      filter.parent_godown = null;
    }

    const godowns = await Godown.find(filter).select("_id name parent_godown");
    res.json(godowns);
  } catch (error) {
    console.error("Error fetching godowns:", error);
    res.status(500).json({ error: "Failed to fetch godowns." });
  }
});

module.exports = router;
