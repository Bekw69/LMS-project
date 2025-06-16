const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Admin', 'Teacher', 'Student']
    },
    senderName: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'voice', 'file', 'document'],
        default: 'text'
    },
    file: {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'readBy.userModel'
        },
        userModel: {
            type: String,
            enum: ['Admin', 'Teacher', 'Student']
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const participantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Admin', 'Teacher', 'Student']
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'member'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    chatType: {
        type: String,
        enum: ['class', 'subject', 'private', 'group'],
        default: 'class'
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass'
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    participants: [participantSchema],
    messages: [messageSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        allowFileUpload: {
            type: Boolean,
            default: true
        },
        maxFileSize: {
            type: Number,
            default: 10 * 1024 * 1024 // 10MB
        },
        allowedFileTypes: [{
            type: String
        }],
        onlyModeratorsCanPost: {
            type: Boolean,
            default: false
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'createdByModel'
    },
    createdByModel: {
        type: String,
        enum: ['Admin', 'Teacher'],
        default: 'Admin'
    }
}, {
    timestamps: true
});

// Индексы для оптимизации
chatSchema.index({ school: 1, isActive: 1 });
chatSchema.index({ 'participants.user': 1, 'participants.userModel': 1 });
chatSchema.index({ class: 1 });
chatSchema.index({ subject: 1 });

// Методы схемы
chatSchema.methods.addMessage = function(messageData) {
    this.messages.push(messageData);
    this.updatedAt = new Date();
    return this.save();
};

chatSchema.methods.updateLastSeen = function(userId, userModel) {
    const participant = this.participants.find(p => 
        p.user.toString() === userId && p.userModel === userModel
    );
    if (participant) {
        participant.lastSeen = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

chatSchema.methods.addParticipant = function(userId, userModel, role = 'member') {
    const existingParticipant = this.participants.find(p => 
        p.user.toString() === userId && p.userModel === userModel
    );
    
    if (!existingParticipant) {
        this.participants.push({
            user: userId,
            userModel: userModel,
            role: role
        });
        return this.save();
    }
    return Promise.resolve(this);
};

chatSchema.methods.removeParticipant = function(userId, userModel) {
    this.participants = this.participants.filter(p => 
        !(p.user.toString() === userId && p.userModel === userModel)
    );
    return this.save();
};

// Статические методы
chatSchema.statics.findUserChats = function(userId, userModel) {
    return this.find({
        'participants.user': userId,
        'participants.userModel': userModel,
        isActive: true
    }).populate('class', 'sclassName')
      .populate('subject', 'subName')
      .sort({ updatedAt: -1 });
};

module.exports = mongoose.model('chat', chatSchema); 