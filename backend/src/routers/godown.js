// routes/godowns.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Godown = require("../models/godown");
const auth = require("../middleware/auth");
const Item = require("../models/items");

// Create a new Godown
router.post("/", auth, async (req, res) => {
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
      if (!mongoose.Types.ObjectId.isValid(parent_godown)) {
        return res
          .status(400)
          .send({ error: "Invalid parent_godown ID format." });
      }

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
      _id: _id || undefined, // Assign _id if provided, else let MongoDB generate it
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
});

// Get all Godowns for the authenticated user
// router.get("/", auth, async (req, res) => {
//   try {
//     const topLevelGodowns = await Godown.aggregate([
//       {
//         $match: {
//           owner: new mongoose.Types.ObjectId(req.user._id),
//           parent_godown: null,
//         },
//       },
//       {
//         $graphLookup: {
//           from: "godowns",
//           startWith: "$_id",
//           connectFromField: "_id",
//           connectToField: "parent_godown",
//           as: "allSubGodowns",
//           depthField: "depth",
//         },
//       },
//       {
//         $lookup: {
//           from: "items",
//           localField: "_id",
//           foreignField: "godown_id",
//           as: "items",
//         },
//       },
//       {
//         $lookup: {
//           from: "items",
//           let: { godownIds: "$allSubGodowns._id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $in: ["$godown_id", "$$godownIds"] },
//               },
//             },
//           ],
//           as: "allItems",
//         },
//       },
//       {
//         $addFields: {
//           subGodowns: {
//             $map: {
//               input: "$allSubGodowns",
//               as: "subGodown",
//               in: {
//                 _id: "$$subGodown._id",
//                 name: "$$subGodown.name",
//                 parent_godown: "$$subGodown.parent_godown",
//               },
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           allSubGodowns: 0,
//           allItems: 0,
//           parent_godown: 0,
//           owner: 0,
//           __v: 0,
//         },
//       },
//     ]);

//     // Function to build the hierarchical structure
//     const buildHierarchy = (godowns) => {
//       const godownMap = {};
//       godowns.forEach((godown) => {
//         godown.subGodowns = [];
//         godown.items = godown.items || [];
//         godownMap[godown._id.toString()] = godown;
//       });

//       topLevelGodowns.forEach((godown) => {
//         if (godown.parent_godown) {
//           const parent = godownMap[godown.parent_godown.toString()];
//           if (parent) {
//             parent.subGodowns.push(godown);
//           }
//         }
//       });

//       return topLevelGodowns;
//     };

//     const hierarchicalGodowns = buildHierarchy(topLevelGodowns);
//     res.send(hierarchicalGodowns);
//   } catch (error) {
//     console.error("Error fetching godowns:", error);
//     res.status(500).send({ error: error.message });
//   }
// });

router.get("/", auth, async (req, res) => {
  try {
    // Find all top-level godowns belonging to the logged-in user
    const topLevelGodowns = await Godown.find({
      owner: req.user._id,
      parent_godown: null,
    });

    // Function to recursively fetch subgodowns and items
    async function getGodownStructure(godown) {
      const subGodowns = await Godown.find({ parent_godown: godown._id });
      const subGodownsData = await Promise.all(
        subGodowns.map(async (subGodown) => {
          const items = await Item.find({ godown_id: subGodown._id }).select(
            "_id name description category quantity brand price status image_url attributes"
          );

          return {
            _id: subGodown._id,
            name: subGodown.name,
            subGodowns: await getGodownStructure(subGodown),
            items: items,
          };
        })
      );

      return subGodownsData;
    }

    // Construct the final response
    const godownsWithSubgodowns = await Promise.all(
      topLevelGodowns.map(async (godown) => ({
        _id: godown._id,
        name: godown.name,
        subGodowns: await getGodownStructure(godown),
      }))
    );

    res.json(godownsWithSubgodowns);
  } catch (error) {
    console.error("Error fetching godowns:", error);
    res
      .status(500)
      .json({ message: "Error fetching godowns", error: error.message });
  }
});

// router.get("/", auth, async (req, res) => {
//   try {
//     const topLevelGodowns = await Godown.find({
//       owner: req.user._id,
//       parent_godown: null,
//     })
//       .populate({
//         path: "subGodowns",
//         populate: {
//           path: "subGodowns",
//           populate: {
//             path: "items",
//           },
//         },
//       })
//       .populate("items")
//       .exec();

//     res.send(topLevelGodowns);
//   } catch (error) {
//     console.error("Error fetching godowns:", error);
//     res.status(500).send({ error: error.message });
//   }
// });

// Get a single Godown by ID
router.get("/:id", auth, async (req, res) => {
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

module.exports = router;
