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
    let positions = {};

    for (const blob of blobs) {
      const filename = blob.pathname.replace('photos/', '');

      // Load positions from the JSON blob
      if (filename === 'positions.json') {
        try {
          const posResp = await fetch(blob.url);
          positions = await posResp.json();
        } catch (e) {
          // ignore parse errors
        }
        continue;
      }

      // Extract slot name from path like "photos/wedding-featured.webp"
      const slotName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      images[slotName] = blob.url;
    }

    return res.status(200).json({ images, positions });
  } catch (error) {
    console.error('List error:', error);
    return res.status(500).json({ error: 'Failed to list images: ' + error.message });
  }
}
