import { Application, Request, Response } from 'express';
import db from '../config/db.config';
import { generateNumericString } from '../utils/robot';

export default class Routes {
  constructor(app: Application) {
    app.get("/api/parcel/generator", async (req: Request, res: Response) => {
      console.log('Generating parcel...');
      try {
        // Select 2 random users from the Client table
        // Make sure the users are active
        // const [senderResult] = await (await db).query('SELECT * FROM Client WHERE clientAccountStatus = "active" ORDER BY RAND() LIMIT 1');
        // const [receiverResult] = await (await db).query('SELECT * FROM Client WHERE clientAccountStatus = "active" ORDER BY RAND() LIMIT 1');

        // i found no user staus in db so i am using this query
        const [senderResult] = await (await db).query('SELECT * FROM Client ORDER BY RAND() LIMIT 1');
        const [receiverResult] = await (await db).query('SELECT * FROM Client ORDER BY RAND() LIMIT 1');

        if (!Array.isArray(senderResult) || senderResult.length === 0 || !Array.isArray(receiverResult) || receiverResult.length === 0) {
          return res.status(404).json({ error: 'No available active clients' });
        }

        const sender = senderResult[0] as { clientId: number, clientName: string, clientEmail: string, clientAddress: string, clientPhone: string };
        const receiver = receiverResult[0] as { clientId: number, clientName: string, clientEmail: string, clientAddress: string, clientPhone: string };

        // Reserve a random location empty cabinet
        const result = await this.reserveRandomEmptyCabinet();

        if (!result?.cabinet_id) {
          return res.status(404).json({ error: 'No available empty cabinets' });
        }

        // Create a parcel with the gathered information
        const parcelFields = {
          trackingNumber: generateNumericString(8),
          pinCode: generateNumericString(4),
          status: 'Sent',
          senderName: sender?.clientName || 'Shiply User',
          senderEmailAddress: sender.clientEmail || 'robot@shiply.com',
          senderAddress: sender.clientAddress || 'Shiply HQ, 123 Fake Street, London, UK',
          senderPhoneNumber: sender.clientPhone || '+358412345678',
          senderID: sender.clientId,
          senderDropOffLocation: sender.clientAddress || 'Shiply HQ, 123 Fake Street, London, UK',
          receiverName: receiver.clientName || 'Shiply User',
          receiverEmailAddress: receiver.clientEmail || 'shiply-receiver@shiply.com',
          receiverAddress: receiver.clientAddress || 'Shiply HQ, 123 Fake Street, London, UK',
          receiverPhoneNumber: receiver.clientPhone || '+358412345678',
          packageWidth: Math.floor(Math.random() * 25) + 1,
          packageHeight: Math.floor(Math.random() * 30) + 1,
          packageMass: Math.floor(Math.random() * 5) + 1,
          receiverLocationId: "",
          senderLocationId: result.location_id,
          lockerID: result.cabinet_id,
        };

        // Insert the parcel into the database
        await (await db).query('INSERT INTO Parcels (trackingNumber, pinCode, status, senderName, senderEmailAddress, senderAddress, senderPhoneNumber, senderID, senderDropOffPoint, receiverName, receiverEmailAddress, receiverAddress, receiverPhoneNumber, packageWidth, packageHeight, packageMass , receiverLocationId, senderLocationId, lockerID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)',
        [parcelFields.trackingNumber, parcelFields.pinCode, parcelFields.status, parcelFields.senderName, parcelFields.senderEmailAddress, parcelFields.senderAddress, parcelFields.senderPhoneNumber, parcelFields.senderID, parcelFields.senderDropOffLocation, parcelFields.receiverName, parcelFields.receiverEmailAddress, parcelFields.receiverAddress, parcelFields.receiverPhoneNumber, parcelFields.packageWidth, parcelFields.packageHeight, parcelFields.packageMass, parcelFields.receiverLocationId, parcelFields.senderLocationId, parcelFields.lockerID]);

        res.status(200).json({ message: 'Parcel generated successfully', parcel: parcelFields });
      } catch (err) {
        console.error('Error generating parcel:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  // function for reserving a random empty cabinet
  async reserveRandomEmptyCabinet() {
    try {
      const [cabinetResult] = await (await db).query('SELECT c.id AS cabinet_id, l.id AS location_id FROM cabinets c JOIN locations l ON c.location_id = l.id WHERE c.status = "empty" LIMIT 1');

      if (!Array.isArray(cabinetResult) || cabinetResult.length === 0) {
        return null;
      }

      const { cabinet_id, location_id } = cabinetResult[0] as { cabinet_id: number, location_id: number };

      if (!cabinet_id || !location_id) {
        return null;
      }

      return { cabinet_id, location_id }

    } catch (err) {
      console.error('Error reserving empty cabinet:', err);
    }
  }
}
