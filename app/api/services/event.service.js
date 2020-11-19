const EventService = module.exports;
const ObjectId = require('mongodb').ObjectID;

EventService.getEvents = (req, res) => {
  const collection = db.collection('events');
  collection.find({})
    .toArray((err, eventDocs) => {
      if (err) {
        return res.json({ error: err });
      }
      res.json(eventDocs);
    });
}

EventService.getEventById = (req, res) => {
  const collection = db.collection('events');
  collection.findOne({ _id: ObjectId(req.params.id) })
    .then(eventDoc => {
      res.json(eventDoc);
    })
    .catch(err => {
      res.json({ error: err });
    });
}


EventService.updateEvent = (req, res) => {
  const collection = db.collection('events');
  console.log('========== ', req.body);
  collection.findOneAndUpdate(
    { _id: ObjectId(req.params.id) },
    {
      $set: {
        name: req.body.name,
        description:  req.body.description,
      },
    },
    { returnOriginal: false }
  )
    .then(eventDoc => {
      return res.json(eventDoc);
    })
    .catch(error => {
      res.json({ error });
    })
}

EventService.deleteEvent = (req, res) => {
  const collection = db.collection('events');

  collection.deleteOne({
    _id: ObjectId(req.params.id)
  })
    .then(result => {
      if (result.nModified) {
        return res.json({
          message: 'Event Deleted Successfully.'
        })
      }
      return res.json({
        error: 'Event does not exist.'
      });
    })
}

EventService.registerEvent = (req, res) => {
  const collection = db.collection('registrations');
  const eventId = req.params.id;

  collection.insertOne({
    event_id: ObjectId(eventId),
    user_email: req.body.email
  })
  .then(result => {
    console.log('------------registration details ', result);
    res.status(201).json({
      message: 'Registered Successfully'
    })
  })
  .catch(err => {
    res.status(400).send({ error: err });
  });
}

EventService.createEvent = (req, res) => {
  const collection = db.collection('events');

  collection.insertOne(req.body)
  .then(result => {

    res.json({
      message: 'Event Created.',
      result,
    })
  })
  .catch(err => {
    res.json( {
      error: err
    })
  })
};

EventService.getRegistrationsForUser = (req, res) => {
  db.collection('registrations').aggregate([
    {
      $match: {
        user_email: req.query.email
      }
    },
    {
      $lookup: {
        from: 'events',
        localField: 'event_id',
        foreignField: '_id',
        as: 'eventDetails'
      }
    }
  ]).toArray(function (err, docs) {
    console.log(err, docs);
    if (err) {
      return res.status(400).send({ error: err });
    }
    res.json(docs);
  })
}

EventService.deactivate = (req, res) => {
  const email = req.body.email;
  console.log(`Deactivating user ${email}`);

  setTimeout(() => {
    res.json({
      message: 'Account Deactivated Successfully.'
    });
  }, 1000);
}