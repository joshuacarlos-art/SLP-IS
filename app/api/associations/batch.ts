import { NextApiRequest, NextApiResponse } from 'next';
import { getCollection, convertDocsIds, toObjectId } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { ids } = req.query;
      
      if (!ids) {
        return res.status(400).json({ error: 'Association IDs are required' });
      }
      
      const associationIds = Array.isArray(ids) ? ids : ids.split(',');
      
      if (associationIds.length === 0) {
        return res.status(200).json([]);
      }
      
      const associationsCollection = await getCollection('associations');
      
      // Convert string IDs to ObjectId
      const objectIds = [];
      for (const id of associationIds) {
        try {
          const objectId = await toObjectId(id);
          objectIds.push(objectId);
        } catch (error) {
          console.warn(`Invalid association ID: ${id}`);
        }
      }
      
      if (objectIds.length === 0) {
        return res.status(200).json([]);
      }
      
      const associations = await associationsCollection.find({
        _id: { $in: objectIds },
        archived: { $ne: true }
      }).toArray();
      
      const formattedAssociations = convertDocsIds(associations);
      
      res.status(200).json(formattedAssociations);
    } catch (error) {
      console.error('Error fetching batch associations:', error);
      res.status(500).json({ error: 'Failed to fetch associations' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}