import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { blobs } = await list({ prefix: 'photos/' });
    
    // Build a map of slot -> url
    const images = {};
    for (const blob of blobs) {
      // Extract slot name from path like "photos/wedding-featured.jpg"
      const filename = blob.pathname.replace('photos/', '');
      const slotName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      images[slotName] = blob.url;
    }

    return res.status(200).json({ images });
  } catch (error) {
    console.error('List error:', error);
    return res.status(500).json({ error: 'Failed to list images: ' + error.message });
  }
}
