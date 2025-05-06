import React, { useEffect, useState } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function FilesPage() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'papers'),
      orderBy('uploadDate', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFiles(docs);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Uploaded Files</h2>
      {files.length === 0 && <p>No files found.</p>}
      <ul>
        {files.map((f) => (
          <li key={f.id}>
            <strong>{f.filename}</strong> —{' '}
            {f.uploadDate?.toDate().toLocaleString() || '—'} —{' '}
            Words: {f.wordCount}
            <br />
          </li>
        ))}
      </ul>
    </div>
  );
}
