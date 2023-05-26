const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../../db/db');

/**
 * Get a specific user by ID
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a user based on their ID.
 *     tags:
 *       - User
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:userId', (req, res) => {
    const userId = req.params.userId;

    const db = getDB();
    const collection = db.collection('user');
    
    collection.findOne({ _id: userId })
    .then(user => {
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.status(200).json(user);
    })
    .catch(err => {
      console.error('Failed to retrieve user from MongoDB:', err);
      res.status(500).send('Failed to retrieve user from MongoDB');
    });
});

/**
 * Get personal garden of a specific user
 * @swagger
 * /user/{userId}/personal-garden:
 *   get:
 *     summary: Get personal garden of a user
 *     description: Retrieve the personal garden of a user based on their ID.
 *     tags:
 *       - User
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: User or plants not found
 *       500:
 *         description: Internal server error
 */
router.get('/:userId/personal-garden', (req, res) => {
    const userId = req.params.userId;
  
    const db = getDB();
    const collection = db.collection('user');
  
    collection.findOne({ _id: userId })
    .then(user => {
      if (!user || !user.personalGarden) {
        return res.status(404).send('User or plants not found');
      }
      res.status(200).json(user.personalGarden);
    })
    .catch(err => {
      console.error('Failed to retrieve plants from MongoDB:', err);
      res.status(500).send('Failed to retrieve plants from MongoDB');
    });
});
  
/**
 * Get history of a specific user
 * @swagger
 * /user/{userId}/history:
 *   get:
 *     summary: Get history of a user
 *     description: Retrieve the history of a user based on their ID.
 *     tags:
 *       - User
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: User or plants not found
 *       500:
 *         description: Internal server error
 */
router.get('/:userId/history', (req, res) => {
    const userId = req.params.userId;

    const db = getDB();
    const userCollection = db.collection('user');
    const plantCollection = db.collection('plant');

    userCollection.findOne({ _id: userId })
    .then(user => {

    if (!user) {
        return res.status(404).send('User not found');
    }

    const plantIds = user.history.map(obj => new ObjectId(obj.plantId));

    plantCollection.find({ _id: { $in: plantIds } }).toArray()
    .then(plants => {

        const userPlants = user.history.map(obj => {
        const plant = plants.find(p => p._id.equals(obj.plantId));
        return {
            plantId: obj.plantId,
            customName: obj.customName,
            intervalZalivanja: obj.intervalZalivanja,
            prviDanZalivanja: obj.prviDanZalivanja,
            date: obj.date,
            image: obj.image,
            plant: plant || null
        };
        });
        res.status(200).json(userPlants);
    });
    })
    .catch(err => {
        console.error('Failed to retrieve user\'s plants:', err);
        res.status(500).send('Failed to retrieve user\'s plants');
    });
});


module.exports = router;