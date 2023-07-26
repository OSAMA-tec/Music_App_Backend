const express = require("express")
const multer = require('multer');
const Track = require('../../models/Track');  
const Artist = require('../../models/Artist');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const router = express.Router()
const auth = require('../../middleware/auth'); 

// configure multer to use memoryStorage
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Firebase
const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.PROJECT_ID,
    "private_key_id": process.env.PRIVATE_KEY_ID,
    "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.CLIENT_EMAIL,
    "client_id": process.env.CLIENT_ID,
    "auth_uri": process.env.AUTH_URI,
    "token_uri": process.env.TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
  }
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET_URL
});

const bucket = admin.storage().bucket();


router.post('/tracks', auth, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'audioFile', maxCount: 1 }]), async (req, res) => {
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
        const coverImage = req.files.coverImage[0];
        const audioFile = req.files.audioFile[0];

        const coverImageOptions = {
            destination: `coverImages/${uuidv4()}${path.extname(coverImage.originalname)}`,
            metadata: { contentType: coverImage.mimetype }
        };
        const audioFileOptions = {
            destination: `audioFiles/${uuidv4()}${path.extname(audioFile.originalname)}`,
            metadata: { contentType: audioFile.mimetype }
        };

        // Create write streams for the uploads to Firebase
        const coverImageUpload = bucket.file(coverImageOptions.destination).createWriteStream({
            metadata: coverImageOptions.metadata
        });
        const audioFileUpload = bucket.file(audioFileOptions.destination).createWriteStream({
            metadata: audioFileOptions.metadata
        });

        // Upload the files to Firebase
        coverImageUpload.end(coverImage.buffer);
        audioFileUpload.end(audioFile.buffer);

        // Get URLs for the uploaded files
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