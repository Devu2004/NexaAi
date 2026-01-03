const userModel = require('../models/user.model');

// A. Logged-in User ka data nikalna
async function getUserProfile(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select('-password');
        
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.status(200).json({
            id: user._id,
            name: user.fullName.firstName, 
            status: user.status || 'System Online',
            image: user.image || ''
        });
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

// B. Profile update karna
async function updateProfile(req, res) {
    try {
        const { name, status, image } = req.body;
        const userId = req.user.id;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { 
                'fullName.firstName': name, 
                status: status, 
                image: image 
            }, 
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "Identity Updated",
            user: {
                id: updatedUser._id,
                name: updatedUser.fullName.firstName,
                status: updatedUser.status,
                image: updatedUser.image
            }
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Update Failed" });
    }
}

module.exports = { getUserProfile, updateProfile };