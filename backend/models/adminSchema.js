const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Admin"
    },
    adminLevel: {
        type: String,
        enum: ['SuperAdmin', 'Admin'],
        default: 'Admin'
    },
    schoolName: {
        type: String,
        unique: true,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        default: null
    },
    isPreinstalled: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    position: {
        type: String,
        default: 'Администратор'
    },
    bio: {
        type: String,
        maxlength: 500,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

adminSchema.index({ email: 1 });
adminSchema.index({ schoolName: 1 });
adminSchema.index({ adminLevel: 1 });

adminSchema.virtual('initials').get(function() {
    return this.name ? this.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';
});

adminSchema.methods.toSafeObject = function() {
    const adminObject = this.toObject();
    delete adminObject.password;
    return adminObject;
};

module.exports = mongoose.model("admin", adminSchema)