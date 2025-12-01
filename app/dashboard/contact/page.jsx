'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchContacts, deleteContact } from '@/store/slices/contactSlice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/UI/Card';
import Pagination from '@/components/UI/Pagination';
import { MessageSquare, Mail, Phone, Calendar, User, Building, Loader2, AlertCircle, Trash2 } from 'lucide-react';

const ContactPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [contactToDelete, setContactToDelete] = useState(null);
  const { contacts, loading, error, deleteLoading } = useSelector((state) => state.contact);
  const { isDark } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const itemsPerPage = 9;

  // Calculate pagination
  const totalItems = Array.isArray(contacts) ? contacts.length : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContacts = useMemo(() =>
    Array.isArray(contacts) ? contacts.slice(startIndex, endIndex) : [],
    [contacts, startIndex, endIndex]
  );

  const monthlyContacts = useMemo(() => {
    if (!Array.isArray(contacts)) return 0;
    return contacts.filter(contact => {
      const contactDate = new Date(contact.created_at);
      const currentDate = new Date();
      return (
        contactDate.getMonth() === currentDate.getMonth() &&
        contactDate.getFullYear() === currentDate.getFullYear()
      );
    }).length;
  }, [contacts]);

  const contactsWithSubject = useMemo(() => {
    if (!Array.isArray(contacts)) return 0;
    return contacts.filter(contact => contact.subject).length;
  }, [contacts]);

  // Fetch contacts on component mount
  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  // Debug: Log the contacts state
  useEffect(() => {
    console.log('Contacts state:', contacts);
    console.log('Contacts is array:', Array.isArray(contacts));
    console.log('Contacts length:', contacts?.length);
  }, [contacts]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async (contactId) => {
    if (!contactId) return;
    const confirmed = window.confirm('Delete this contact message? This action cannot be undone.');
    if (!confirmed) return;

    setContactToDelete(contactId);
    try {
      await dispatch(deleteContact(contactId)).unwrap();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    } finally {
      setContactToDelete(null);
    }
  };

  if (loading && contacts.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${isDark ? 'text-primarycolor' : 'text-primarycolor'
              }`} />
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Loading contact messages...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'
              }`}>
              Contact Messages
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
              View and manage contact form submissions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className={`w-8 h-8 ${isDark ? 'text-primarycolor' : 'text-primarycolor'
              }`} />
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'
              }`}>
              {totalItems}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  Total Messages
                </p>
                <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                  {totalItems}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'
                }`}>
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  This Month
                </p>
                <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                  {monthlyContacts}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isDark ? 'bg-green-900' : 'bg-green-100'
                }`}>
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  Subjects Provided
                </p>
                <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                  {contactsWithSubject}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isDark ? 'bg-yellow-900' : 'bg-yellow-100'
                }`}>
                <Building className="w-6 h-6 text-primarydarkcolor" />
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Grid */}
        {(!Array.isArray(contacts) || contacts.length === 0) && !loading ? (
          <Card className="p-12 text-center">
            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
              }`}>
              No Contact Messages Yet
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
              Contact messages will appear here when submitted
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(currentContacts) && currentContacts.map((contact) => (
              <Card key={contact.id} className="p-6 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-primarydarkcolor text-black' : 'bg-primarycolor text-black'
                      }`}>
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {contact.name || contact.fullName || 'Unknown Contact'}
                      </h3>
                      {contact.subject && (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {contact.subject}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      {formatDate(contact.created_at)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {contact.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {contact.phone || contact.mobile || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                    Message:
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {contact.message}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(contact.id)}
                  disabled={deleteLoading || contactToDelete === contact.id}
                  className={`mt-4 inline-flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-md border transition-colors ${isDark ? 'border-red-700 text-red-400 hover:bg-red-900/30' : 'border-red-200 text-red-600 hover:bg-red-50'} ${deleteLoading && contactToDelete === contact.id ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                  <Trash2 size={16} />
                  <span>{deleteLoading && contactToDelete === contact.id ? 'Deleting...' : 'Delete'}</span>
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {Array.isArray(contacts) && contacts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}


      </div>
    </DashboardLayout>
  );
};

export default ContactPage;