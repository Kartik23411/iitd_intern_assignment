import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { db } from '../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/webpack';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const extractWordCount = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === 'application/pdf') {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(' ');
      }
      return text.trim().split(/\s+/).length;
    }

    if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value: text } = await mammoth.extractRawText({ arrayBuffer });
      return text.trim().split(/\s+/).length;
    }

    throw new Error('Unsupported file type');
  };

  const handleUpload = async () => {
    if (!file) return alert('Select a file first.');

    try {
      setLoading(true);

      const filePath = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('papers')
        .upload(filePath, file, {
          onUploadProgress: (evt) =>
            setProgress(Math.round((evt.loaded / evt.total) * 100)),
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('papers').getPublicUrl(filePath);

      const wordCount = await extractWordCount(file);

      await addDoc(collection(db, 'papers'), {
        filename: file.name,
        uploadDate: serverTimestamp(),
        downloadUrl: publicUrl,
        wordCount,
      });

      alert('File uploaded & metadata saved!');
      setFile(null);
      setProgress(0);
    } catch (err) {
      console.error(err);
      alert(`Upload error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Document</h2>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading…' : 'Upload'}
      </button>
      {progress > 0 && <p>Progress: {progress}%</p>}
    </div>
  );
}
