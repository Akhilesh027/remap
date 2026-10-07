// NotificationService/manager.js

const dao = require('./dao'); 
const { NOTIFICATION_TYPES, TEMPLATES } = require('./types');

class NotificationManager {


    /**
     * Public method to trigger the creation of a notification.
     * @param {string} type - The NOTIFICATION_TYPE constant.
     * @param {object} data - Event-specific data (e.g., propertyId, propertyName).
     */
    async createNotification(type, data) {
        try {
            const recipientIds = this._getRecipients(type, data);
            
            if (recipientIds.length === 0) {
                console.log(`No recipients found for event type: ${type}`);
                return;
            }

            const notifications = recipientIds.map(userId => 
                this._buildNotificationDocument(userId, type, data)
            );
            
            await dao.insertMany(notifications);
            // Optional: Emit a real-time signal here (e.g., using Socket.io)
            // recipientIds.forEach(id => socketIo.to(`user-${id}`).emit('newNotification', { count: 1 }));

        } catch (error) {
            console.error(`Manager Error in createNotification (${type}):`, error.message);
            // Non-fatal error: don't crash the main API process
        }
    }
    
    /**
     * Determines which users should receive the notification.
     */
    _getRecipients(type, data) {
        // This logic will be complex in a real app (checking subscriptions, roles, etc.)
        
        if (type === NOTIFICATION_TYPES.PROPERTY_ADDED) {
            // Logic: Notify all Admin users (assuming Admin ID is 1)
            return [1]; 
        }
        
        if (type === NOTIFICATION_TYPES.PROPERTY_STATUS_UPDATE) {
            // Logic: Notify the agent who owns the property
            return [data.agentId]; // Assuming 'agentId' is passed in data
        }
        
        return [];
    }

    /**
     * Builds the MongoDB document based on the type and data.
     */
    _buildNotificationDocument(userId, type, data) {
        const template = TEMPLATES[type];
        
        return {
            userId: userId,
            type: type,
            title: template.title(data),
            message: template.message(data),
            entity: {
                type: template.entityType,
                id: data.propertyId // assuming propertyId is standard for these events
            },
            status: {
                isRead: false,
                readAt: null
            },
            createdAt: new Date()
        };
    }
    
    // --- Public methods for the Frontend API (e.g., calling from your API routes) ---
    
    async fetchUserNotifications(userId, isRead = false) {
        return await dao.getByUserId(userId, 20, 0, isRead);
    }
    
    async readNotification(notificationId, userId) {
        return await dao.markAsRead(notificationId, userId);
    }
    
    async getUnreadCount(userId) {
        return await dao.getUnreadCount(userId);
    }
}

module.exports = new NotificationManager();