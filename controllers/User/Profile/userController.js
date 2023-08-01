const User = require('../../../models/User');
const twilio = require('twilio');

const getUser = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select(
        'local.email local.picURL local.phoneNumber role'
      );
      if (!user) {
        return res.status(400).json({
          message: 'User not found',
        });
      }
  
      res.json(user);
    } catch (err) {
      console.error(err.message);
      // Check for a bad ObjectId
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'User not found' });
      }
      res.status(500).send('Server error');
    }
  };




  const updateUser = async (req, res) => {
    const { email, name, phoneNumber } = req.body;
    const id = req.user.id;
  
    if (!email  && !name && !phoneNumber) {
      return res.status(400).json({ msg: 'Enter at least one field to update: email, name, or phoneNumber' });
    }
  
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      if (email) {
        user.local.email = email;
      }
  
      if (name) {
        user.local.name = name;
      }
  
      if (phoneNumber) {
        if(!email){
            user.local.tempEmail = user.local.email;
        }
        else{
            user.local.tempEmail = email;
        }
        user.local.tempNumber = phoneNumber;
        user.local.verified = false;
        user.local.otp= otp;
        twilioClient.messages.create({
            body: `Your OTP for MUSIC APP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
          })
            .then(() => { console.log('OTP sent via SMS') })
            .catch((error) => { console.error(error); })
            
      }
  
      await user.save();

      if(!phoneNumber){
          return res.status(200).json({ msg: 'User updated successfully!' });
        }else{
          return res.status(200).json({ msg: 'User updated successfully! and Kindly enter Otp' });
      }
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };


const deleteUser=async (req,res)=>{
    try{
        const id = req.user.id;
        const user = await User.findById(id);

        // User not found
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user
        await User.deleteOne({ _id: id });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

module.exports = { getUser, updateUser,deleteUser };