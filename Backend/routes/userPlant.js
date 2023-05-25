const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { getDB } = require('../db/db');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/add', upload.any(), (req, res, next) => {
  const { originalname, mimetype, buffer } = req.files[0];
  const { userId, latin, common, description, intervalZalivanja, prviDanZalivanja } = req.body;

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
        personalGarden: { _id: new ObjectId, latin: latin, common: common, description: description, intervalZalivanja: intervalZalivanja, prviDanZalivanja: prviDanZalivanja, image: newImage }
      }
    }
  )
  .then(() => {
    res.status(200).send(`Plant added, user: ${userId}`);
  })
  .catch(err => {
    console.error('Failed to add plant to MongoDB:', err);
    res.status(500).send('Failed to add plant to MongoDB');
  });
});


router.post('/add-history', upload.any(), (req, res, next) => {
  const { originalname, mimetype, buffer } = req.files[0];
  const { userId, plantId, customName, intervalZalivanja, prviDanZalivanja, date } = req.body;

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
        history: { _id: new ObjectId, plantId: plantId, customName: customName, intervalZalivanja: intervalZalivanja, prviDanZalivanja: prviDanZalivanja, date: date, image: newImage }
      }
    }
  )
  .then(() => {
    res.status(200).send(`Plant added, user: ${userId}`);
  })
  .catch(err => {
    console.error('Failed to add plant to MongoDB:', err);
    res.status(500).send('Failed to add plant to MongoDB');
  });
});

router.get('/personalGarden/:userId', (req, res) => {
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


router.get('/history/:userId', (req, res) => {
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


router.delete('/personalGarden/:userId/:plantId', (req, res) => {

  const db = getDB();
  const userId = req.params.userId;
  const plantId = req.params.plantId;

  const userCollection = db.collection('user');

  userCollection.findOne({ _id: userId })
  .then(user => {

    if (!user) {
      return res.status(404).send('User not found');
    }

    const personalGarden = user.personalGarden;
    const updatedGarden = personalGarden.filter(obj => !obj._id.toString() === (plantId));

    userCollection.updateOne(
      { _id: userId },
      { $set: { personalGarden: updatedGarden } }
    ).then(() => {
      res.status(200).send('Plant deleted from personal garden');
    });
  })
  .catch (err => {
    console.error('Failed to delete plant from personal garden:', err);
    res.status(500).send('Failed to delete plant from personal garden');
  });
});

router.put('/personalGarden/:userId/:plantId', upload.none(), (req, res) => {
  const db = getDB();
  const userId = req.params.userId;
  const plantId = req.params.plantId;
  const common = req.body.common;

  const userCollection = db.collection('user');

  userCollection.findOne({ _id: userId })
    .then(user => {
      if (!user) {
        return res.status(404).send('User not found');
      }

      const personalGarden = user.personalGarden;
      const updatedGarden = personalGarden.map(obj => {
        if (obj._id.toString() === plantId) {
          obj.common = common;
        }
        return obj;
      });

      userCollection.updateOne(
        { _id: userId },
        { $set: { personalGarden: updatedGarden } }
      )
        .then(() => {
          res.status(200).send('Plant common attribute updated');
        })
        .catch(err => {
          console.error('Failed to update plant common attribute:', err);
          res.status(500).send('Failed to update plant common attribute');
        });
    })
    .catch(err => {
      console.error('Failed to find user:', err);
      res.status(500).send('Failed to find user');
    });
});


router.put('/personalGarden/:userId/:plantId/watered', (req, res) => {
  const userId = req.params.userId;
  const plantId = req.params.plantId;
  const watered = req.body.watered;
  
  const db = getDB();
  const userCollection = db.collection('user');

  userCollection.findOneAndUpdate(
    { _id: userId, 'personalGarden._id': plantId },
    { $set: { 'personalGarden.$.watered': watered } }
  )
    .then(result => {
      if (!result.value) {
        return res.status(404).send('User or plant not found');
      }
      res.status(200).send('Plant watered status updated');
    })
    .catch(err => {
      console.error('Failed to update plant watered status:', err);
      res.status(500).send('Failed to update plant watered status');
    });
});




module.exports = router;