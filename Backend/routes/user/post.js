const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../../db/db');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Add a new user
 * @swagger
 * /user/add-user:
 *   post:
 *     summary: Add a new user
 *     description: Create a new user in the system.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *               notifications:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User added successfully
 *       500:
 *         description: Failed to add new user to MongoDB
 */
router.post('/add-user', upload.none(), (req, res, next) => {
    const { userId, name, surname, email, notifications } = req.body;
  
    const db = getDB();
    const collection = db.collection('user');

    const newUser = {
        _id: userId,
        name: name,
        surname: surname,
        email: email,
        notifications: notifications,
        history: [],
        personalGarden: []
    };

    collection.insertOne(newUser)
    .then(() => {
      res.status(200).send('New user added to MongoDB');
    })
    .catch(err => {
      console.error('Failed to add new user to MongoDB:', err);
      res.status(500).send('Failed to add new user to MongoDB');
    });
});


/**
 * Add a plant to personal garden
 * @swagger
 * /user/add-personal-garden:
 *   post:
 *     summary: Add a plant to personal garden
 *     description: Add a new plant to the personal garden of a user.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               latin:
 *                 type: string
 *               common:
 *                 type: string
 *               customName:
 *                 type: string
 *               description:
 *                 type: string
 *               watering:
 *                 type: string
 *               image:
 *                 type: file
 *     responses:
 *       200:
 *         description: Plant added successfully
 *       500:
 *         description: Failed to add plant to MongoDB
 */
router.post('/add-personal-garden', upload.any(), (req, res, next) => {
    const { originalname, mimetype, buffer } = req.files[0];
    console.log(req.files)
    const { userId, latin, common, customName, description, watering } = req.body;

    const db = getDB();
    const collection = db.collection('user');

    const newImage = {
        originalname,
        mimetype,
        buffer
    };

    collection.updateOne(
    { _id: userId },
    {
        $push: {
            personalGarden: { _id: new ObjectId, latin: latin, common: common, customName: customName, description: description, watering: watering, image: newImage }
        }
    }
    )
    .then(() => {
        res.status(200).send(`Plant added, user: ${userId}`);
    })
    .catch(err => {
        console.error('Failed to add plant to MongoDB:', err);
        if (err == 'RangeError: offset is out of bounds') {
            res.send('choose smaller image');
        } else {
            res.status(500).send('Failed to add plant to MongoDB');
        }
    });
});


/**
 * Add a plant to user's history
 * @swagger
 * /user/add-history:
 *   post:
 *     summary: Add a plant to user's history
 *     description: Add a new plant to the history of a user.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               plantId:
 *                 type: string
 *               customName:
 *                 type: string
 *               date:
 *                 type: string
 *               image:
 *                 type: file
 *     responses:
 *       200:
 *         description: Plant added successfully
 *       500:
 *         description: Failed to add plant to MongoDB
 */
router.post('/add-history', upload.any(), (req, res, next) => {
    const { originalname, mimetype, buffer } = req.files[0];
    const { userId, plantId, customName, date } = req.body;

    const db = getDB();
    const collection = db.collection('user');

    const newImage = {
        originalname,
        mimetype,
        buffer
    };

    collection.updateOne(
    { _id: userId },
    {
        $push: {
            history: { _id: new ObjectId, plantId: plantId, customName: customName, date: new Date(date).toISOString(), image: newImage }
        }
    }
    )
    .then(() => {
        res.status(200).send(`Plant added, user: ${userId}`);
    })
    .catch(err => {
        console.error('Failed to add plant to MongoDB:', err);
        if (err == 'RangeError: offset is out of bounds') {
            res.send('choose smaller image');
        } else {
            res.status(500).send('Failed to add plant to MongoDB');
        }
    });
});

module.exports = router;