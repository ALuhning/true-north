import { useState } from 'react';
import { api } from '@/lib/api';

interface QuestionEditorProps {
  code: string;
  question?: {
    id: string;
    prompt: string;
    answer: 'CAN' | 'USA';
    explanation: string;
    tags: string;
    image_url: string | null;
  };
  onSave: () => void;
  onCancel: () => void;
  setMessage: (msg: string) => void;
}

export function QuestionEditor({ code, question, onSave, onCancel, setMessage }: QuestionEditorProps) {
  const [prompt, setPrompt] = useState(question?.prompt || '');
  const [answer, setAnswer] = useState<'CAN' | 'USA'>(question?.answer || 'CAN');
  const [explanation, setExplanation] = useState(question?.explanation || '');
  const [tags, setTags] = useState(question?.tags || '');
  const [imageUrl, setImageUrl] = useState(question?.image_url || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (question) {
        await api.updateQuestion(code, question.id, {
          prompt,
          answer,
          explanation,
          tags,
          image_url: imageUrl || undefined
        });
        setMessage('Question updated successfully');
      } else {
        await api.createQuestion(code, {
          prompt,
          answer,
          explanation,
          tags,
          image_url: imageUrl || undefined
        });
        setMessage('Question created successfully');
      }
      onSave();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 space-y-4">
      <h3 className="text-xl font-bold">
        {question ? `Edit: ${question.prompt}` : 'New Question'}
      </h3>

      <div>
        <label className="block text-sm font-medium mb-2">Prompt *</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-canada-500 focus:outline-none"
          placeholder="e.g., Hawaiian pizza"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Answer *</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="CAN"
              checked={answer === 'CAN'}
              onChange={(e) => setAnswer(e.target.value as 'CAN' | 'USA')}
              className="w-5 h-5"
            />
            <span className="text-lg">🍁 Canada</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="USA"
              checked={answer === 'USA'}
              onChange={(e) => setAnswer(e.target.value as 'CAN' | 'USA')}
              className="w-5 h-5"
            />
            <span className="text-lg">🦅 USA</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Explanation *</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-canada-500 focus:outline-none"
          placeholder="e.g., Invented by Sam Panopoulos in Ontario, Canada in 1962."
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-canada-500 focus:outline-none"
          placeholder="e.g., food,invention"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image URL</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-canada-500 focus:outline-none"
          placeholder="https://images.unsplash.com/photo-..."
        />
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EInvalid URL%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors"
        >
          {saving ? 'Saving...' : question ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
