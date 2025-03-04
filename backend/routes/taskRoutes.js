const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { validateTaskInput } = require('../utils/validators');

// Get all tasks (with filtering options)
router.get('/', async (req, res) => {
  try {
    const { status, priority, search, sort = 'createdAt', order = 'desc' } = req.query;
    const queryObject = { user: req.user.id };

    if (status) {
      queryObject.status = status;
    }

    if (priority) {
      queryObject.priority = priority;
    }

    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Create query object
    let result = Task.find(queryObject);

    // Sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    result = result.sort({ [sort]: sortOrder });

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);

    // Execute query
    const tasks = await result;
    const transformedTasks = tasks.map(task => task.getInfo());

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: transformedTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task.getInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const { isValid, errors } = validateTaskInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // Limit the number of tags
    if (req.body.tags && req.body.tags.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 tags allowed'
      });
    }

    // Create task
    const task = new Task({
      ...req.body,
      user: req.user.id
    });

    await task.save();

    res.status(201).json({
      success: true,
      data: task.getInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update task
router.patch('/:id', async (req, res) => {
  try {
    const { isValid, errors } = validateTaskInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // Limit the number of tags
    if (req.body.tags && req.body.tags.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 tags allowed'
      });
    }

    // Find and update task
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task.getInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Move task (update status)
router.patch('/:id/move', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['todo', 'inProgress', 'review', 'done'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    // Find and update task status
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task.getInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get tasks statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Transform stats into a more usable format
    const statsObject = {
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0
    };

    stats.forEach(stat => {
      statsObject[stat._id] = stat.count;
    });

    // Calculate total tasks
    statsObject.total = Object.values(statsObject).reduce((acc, val) => acc + val, 0);

    res.status(200).json({
      success: true,
      data: statsObject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;