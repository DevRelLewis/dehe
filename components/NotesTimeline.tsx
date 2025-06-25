import React from 'react';
import { FileText, MessageCircle, Clock, User } from 'lucide-react';
import { DoctorNote, Memo } from '../types/patient';

interface NotesTimelineProps {
  notes: DoctorNote[];
  memos: Memo[];
}

interface TimelineItem {
  id: string;
  type: 'note' | 'memo';
  date: string;
  content: string;
  author: string;
  title?: string;
  summary?: string;
}

const NotesTimeline: React.FC<NotesTimelineProps> = ({ notes, memos }) => {
  // Combine and sort notes and memos by date
  const timelineItems: TimelineItem[] = [
    ...notes.map(note => ({
      id: note.id,
      type: 'note' as const,
      date: note.createdDate,
      content: note.content,
      summary: note.summary,
      author: note.providerNames.join(', '),
      title: `Doctor's Note - ${new Date(note.createdDate).toLocaleDateString()}`
    })),
    ...memos.map(memo => ({
      id: memo.id,
      type: 'memo' as const,
      date: memo.createdDate,
      content: memo.note,
      author: `${memo.creator.firstName} ${memo.creator.lastName}`,
      title: `Memo - ${new Date(memo.createdDate).toLocaleDateString()}`
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (timelineItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Memos</h2>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notes or memos found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Notes & Memos</h2>
      
      <div className="space-y-6">
        {timelineItems.map((item, index) => (
          <div key={item.id} className="relative">
            {/* Timeline line */}
            {index < timelineItems.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
            )}
            
            <div className="flex space-x-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                item.type === 'note' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-green-100 text-green-600'
              }`}>
                {item.type === 'note' ? (
                  <FileText className="w-6 h-6" />
                ) : (
                  <MessageCircle className="w-6 h-6" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{item.author}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(item.date).toLocaleString()}</span>
                  </div>

                  {item.summary && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-900 mb-1">Summary:</p>
                      <p className="text-sm text-blue-800">{item.summary}</p>
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesTimeline;
