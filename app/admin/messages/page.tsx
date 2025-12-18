'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi, ContactMessage } from '@/lib/api';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notificationModal, setNotificationModal] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotificationModal({ show: true, type, title, message });
  };

  const closeNotification = () => {
    setNotificationModal({ show: false, type: 'success', title: '', message: '' });
  };

  const openDeleteModal = (message: ContactMessage) => {
    setMessageToDelete(message);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setMessageToDelete(null);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllMessages(0, 100);
      if (response.success && response.data) {
        setMessages(response.data.content || []);
      } else {
        setError(response.message || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'unread') return !message.read;
    if (filter === 'replied') return message.replied;
    return true;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.read).length,
    replied: messages.filter(m => m.replied).length,
  };

  const handleMarkAsRead = async (message: ContactMessage) => {
    if (message.read) return;

    try {
      const response = await adminApi.markMessageAsRead(message.id);
      if (response.success) {
        await fetchMessages();
      }
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const handleSelectMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyText('');
    if (!message.read) {
      await handleMarkAsRead(message);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setActionLoading(true);
      const response = await adminApi.replyToMessage(selectedMessage.id, replyText.trim());
      if (response.success) {
        await fetchMessages();
        setSelectedMessage(null);
        setReplyText('');
        showNotification('success', 'Reply Sent', 'Your reply has been sent successfully.');
      } else {
        showNotification('error', 'Failed to Send', response.message || 'Failed to send reply');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to send reply. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await adminApi.deleteMessage(messageToDelete.id);
      if (response.success) {
        await fetchMessages();
        setSelectedMessage(null);
        closeDeleteModal();
        showNotification('success', 'Message Deleted', 'The message has been deleted successfully.');
      } else {
        showNotification('error', 'Delete Failed', response.message || 'Failed to delete message');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to delete message. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <AdminSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-[#333333] opacity-70">Loading messages...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <AdminSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={fetchMessages}
              className="ml-4 text-red-700 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <AdminSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-[#333333] mb-1">Contact Messages</h1>
                <p className="text-sm text-[#333333] opacity-70">
                  View and respond to customer inquiries
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Messages</p>
              <p className="text-2xl font-bold text-[#333333]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Unread</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Replied</p>
              <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <label className="block text-xs font-semibold text-[#333333] mb-2">Filter Messages</label>
            <div className="flex gap-2">
              {(['all', 'unread', 'replied'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === f
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Messages List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#333333]">Messages ({filteredMessages.length})</h2>
            </div>
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-[#333333] opacity-70">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`p-4 cursor-pointer hover:bg-[#F8F4F0] transition-colors ${
                      !message.read ? 'bg-[#FF6B35]/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          message.read ? 'bg-gray-400' : 'bg-[#FF6B35]'
                        }`}>
                          {message.firstName?.[0]}{message.lastName?.[0]}
                        </div>
                        <div>
                          <p className={`text-sm ${!message.read ? 'font-bold' : 'font-medium'} text-[#333333]`}>
                            {message.fullName || `${message.firstName} ${message.lastName}`}
                          </p>
                          <p className="text-xs text-[#333333] opacity-70">{message.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#333333] opacity-70">{formatDate(message.createdAt)}</p>
                        <div className="flex gap-1 mt-1 justify-end">
                          {!message.read && (
                            <span className="px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-xs font-semibold">
                              New
                            </span>
                          )}
                          {message.replied && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              Replied
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[#333333] line-clamp-2">{message.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-start sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">Message Details</h2>
                <p className="text-xs text-[#333333] opacity-70">
                  From: {selectedMessage.fullName || `${selectedMessage.firstName} ${selectedMessage.lastName}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {/* Sender Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#F8F4F0] p-3 rounded-lg">
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Email</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedMessage.email}</p>
                </div>
                <div className="bg-[#F8F4F0] p-3 rounded-lg">
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Received</p>
                  <p className="text-sm font-semibold text-[#333333]">{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedMessage.read ? 'bg-gray-100 text-gray-800' : 'bg-[#FF6B35]/10 text-[#FF6B35]'
                }`}>
                  {selectedMessage.read ? 'Read' : 'Unread'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedMessage.replied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedMessage.replied ? 'Replied' : 'Awaiting Reply'}
                </span>
              </div>

              {/* Message Content */}
              <div className="mb-4">
                <p className="text-xs text-[#333333] opacity-70 mb-2">Message</p>
                <div className="bg-[#F8F4F0] p-4 rounded-lg">
                  <p className="text-sm text-[#333333] whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Previous Reply */}
              {selectedMessage.replied && selectedMessage.replyMessage && (
                <div className="mb-4">
                  <p className="text-xs text-[#333333] opacity-70 mb-2">Your Reply ({selectedMessage.repliedAt ? formatDate(selectedMessage.repliedAt) : ''})</p>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-[#333333] whitespace-pre-wrap">{selectedMessage.replyMessage}</p>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              {!selectedMessage.replied && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#333333] mb-2">
                    Write a Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none resize-none"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!selectedMessage.replied && (
                  <button
                    onClick={handleReply}
                    disabled={actionLoading || !replyText.trim()}
                    className="flex-1 bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Sending...' : 'Send Reply'}
                  </button>
                )}
                <button
                  onClick={() => openDeleteModal(selectedMessage)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Delete Message
                </button>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && messageToDelete && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Delete Message</h2>
              <button onClick={closeDeleteModal} className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <p className="text-sm text-[#333333] text-center mb-2">
                Are you sure you want to delete this message from
              </p>
              <p className="text-sm font-semibold text-[#333333] text-center mb-4">
                {messageToDelete.fullName || `${messageToDelete.firstName} ${messageToDelete.lastName}`}?
              </p>
              <p className="text-xs text-gray-500 text-center mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notificationModal.show && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">{notificationModal.title}</h2>
              <button onClick={closeNotification} className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full ${
                notificationModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {notificationModal.type === 'success' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-[#333333] text-center mb-6">{notificationModal.message}</p>
              <button
                onClick={closeNotification}
                className={`w-full px-4 py-2 text-sm rounded-lg font-semibold transition-colors cursor-pointer ${
                  notificationModal.type === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
