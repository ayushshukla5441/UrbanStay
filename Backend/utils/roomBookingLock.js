import { randomUUID } from "node:crypto";
import Room from "../models/hotel.room.js";
import Hotel from "../models/hotel.model.js";

const LOCK_TTL_MS = 2 * 60 * 1000;
const LOCK_ATTEMPTS = 20;
const LOCK_RETRY_MS = 100;

export class RoomBookingLockError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const withDocumentBookingLock = async (Model, documentId, resourceName, operation) => {
    const lockToken = randomUUID();
    let document = null;

    for (let attempt = 0; attempt < LOCK_ATTEMPTS && !document; attempt += 1) {
        const now = new Date();
        document = await Model.findOneAndUpdate(
            {
                _id: documentId,
                $or: [
                    { bookingLockExpiresAt: { $exists: false } },
                    { bookingLockExpiresAt: null },
                    { bookingLockExpiresAt: { $lte: now } },
                ],
            },
            {
                $set: {
                    bookingLockToken: lockToken,
                    bookingLockExpiresAt: new Date(now.getTime() + LOCK_TTL_MS),
                },
            },
            { new: true }
        );

        if (!document && attempt < LOCK_ATTEMPTS - 1) {
            await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_MS));
        }
    }

    if (!document) {
        const documentExists = await Model.exists({ _id: documentId });
        if (!documentExists) {
            throw new RoomBookingLockError(404, `${resourceName} not found`);
        }
        throw new RoomBookingLockError(
            409,
            `This ${resourceName.toLowerCase()} is processing another request. Please retry.`
        );
    }

    try {
        return await operation({ document, lockToken });
    } finally {
        const releaseResult = await Model.updateOne(
            { _id: documentId, bookingLockToken: lockToken },
            { $unset: { bookingLockToken: 1, bookingLockExpiresAt: 1 } }
        );
        if (releaseResult.modifiedCount !== 1 && await Model.exists({ _id: documentId })) {
            console.error(`Could not release booking lock for ${resourceName.toLowerCase()} ${documentId}`);
        }
    }
};

export const withRoomBookingLock = (roomId, operation) =>
    withDocumentBookingLock(Room, roomId, "Room", ({ document, lockToken }) =>
        operation({ room: document, lockToken })
    );

export const withHotelBookingLock = (hotelId, operation) =>
    withDocumentBookingLock(Hotel, hotelId, "Hotel", ({ document, lockToken }) =>
        operation({ hotel: document, lockToken })
    );
