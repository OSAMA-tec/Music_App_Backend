
const express=require("express")
const multer = require('multer');
const Track = require('../../models/Track');  
const Artist = require('../../models/Artist');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const router=express.Router()
const auth = require('../../middleware/auth'); 

const upload = multer({ dest: 'uploads/' });

// Initialize Firebase
const serviceAccount = require('../../musicapp-ce429-firebase-adminsdk-7emsl-03b36a5b72.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET_URL
});

const bucket = admin.storage().bucket();

router.post('/tracks',auth, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'audioFile', maxCount: 1 }]), async (req, res) => {
    const { title,   duration } = req.body;
    if (!title ||  !duration ||  !req.files) {
        return res.status(400).json({
            success: false,
            message: 'Required fields are missing',
        });
    }
    const User=await Artist.findOne({userId:req.user.id})
    if(!User){
        return res.status(400).json({
            success: false,
            message: 'User not Found',
        });
    }
    const artist=User._id;
    const genre=User.genre;


    try {
        const coverImageOptions = {
            destination: `coverImages/${uuidv4()}${path.extname(req.files.coverImage[0].originalname)}`,
            metadata: { contentType: req.files.coverImage[0].mimetype }
        };
        const audioFileOptions = {
            destination: `audioFiles/${uuidv4()}${path.extname(req.files.audioFile[0].originalname)}`,
            metadata: { contentType: req.files.audioFile[0].mimetype }
        };

        await bucket.upload(req.files.coverImage[0].path, coverImageOptions);
        await bucket.upload(req.files.audioFile[0].path, audioFileOptions);

        const coverImageUrls = await bucket.file(coverImageOptions.destination).getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
        });

        const audioFileUrls = await bucket.file(audioFileOptions.destination).getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
        });

        const newTrack = new Track({
            title,
            artist,
            duration,
            genre,
            coverImage: coverImageUrls[0],
            audioFile: audioFileUrls[0], 
        });

        const savedTrack = await newTrack.save();

        return res.status(201).json({
            success: true,
            message: 'Track created successfully',
            track: savedTrack,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the track',
        });
    }
});

module.exports = router;