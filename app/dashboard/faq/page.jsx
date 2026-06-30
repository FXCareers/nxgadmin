'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/Textarea';
import { AlertCircle, ChevronDown, ChevronUp, Edit, Loader2, Plus, Tag } from 'lucide-react';
import { clearFaqError, createFaq, fetchFaqs, setActiveCategory, updateFaq } from '@/store/slices/faqSlice';

const safeRender = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const FaqPage = () => {
  const dispatch = useDispatch();
  const { items, categories, activeCategory, loading, createLoading, updateLoading, error } = useSelector((state) => state.faq);
  const { isDark } = useSelector((state) => state.theme);

  const [expandedId, setExpandedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
  });

  useEffect(() => {
    dispatch(fetchFaqs());
  }, [dispatch]);

  const tabOptions = useMemo(() => {
    const uniqueCategories = categories && categories.length ? categories : [];
    return ['all', ...uniqueCategories];
  }, [categories]);

  const handleTabChange = (tab) => {
    dispatch(setActiveCategory(tab));
    setExpandedId(null);

    if (tab === 'all') {
      dispatch(fetchFaqs());
    } else {
      dispatch(fetchFaqs({ category: tab }));
    }
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: activeCategory !== 'all' ? activeCategory : '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: '',
    });
    dispatch(clearFaqError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      question: formData.question?.trim(),
      answer: formData.answer?.trim(),
      category: formData.category?.trim() || 'General',
    };

    if (!payload.question || !payload.answer) return;

    try {
      if (editingFaq) {
        await dispatch(updateFaq({ id: editingFaq.id, ...payload })).unwrap();
      } else {
        await dispatch(createFaq(payload)).unwrap();
      }

      const shouldRefetchForTab =
        activeCategory !== 'all' &&
        payload.category &&
        payload.category !== activeCategory;

      if (shouldRefetchForTab) {
        await dispatch(fetchFaqs({ category: payload.category }));
        dispatch(setActiveCategory(payload.category));
      }

      closeModal();
    } catch (err) {
      console.error('Failed to save FAQ:', err);
    }
  };

  const renderAccordion = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-primarycolor" />
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className={`text-center py-12 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          <p className="text-lg font-semibold">No FAQs found</p>
          <p className="text-sm mt-1">Use &quot;Add FAQ&quot; to create your first entry.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((faq) => {
          const isOpen = expandedId === faq.id;

          return (
            <Card key={faq.id || faq.question} className="border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setExpandedId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        isDark
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-primarycolor/10 text-primarycolor'
                      }`}
                    >
                      <Tag size={14} />
                      {safeRender(faq.category || 'General')}
                    </span>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {safeRender(faq.question)}
                    </p>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {safeRender(faq._raw?.subtitle || faq._raw?.summary || '')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(faq);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {isOpen && (
                <div className={`px-5 pb-5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  <p className="leading-relaxed whitespace-pre-line">{safeRender(faq.answer)}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              FAQs
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage frequently asked questions by category.
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2"
            disabled={createLoading}
          >
            {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} />}
            <span>{createLoading ? 'Saving...' : 'Add FAQ'}</span>
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {tabOptions.map((tab) => {
            const isActive = (activeCategory || 'all').toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primarycolor text-white shadow-md'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 border border-gray-700'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {tab === 'all' ? 'All' : safeRender(tab)}
              </button>
            );
          })}
        </div>

        {renderAccordion()}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingFaq ? 'Update FAQ' : 'Add FAQ'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Enter question"
            required
          />
          <Textarea
            label="Answer"
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            placeholder="Enter answer"
            rows={4}
            required
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="General, Security, Updated Category..."
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={updateLoading || createLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-2"
              disabled={updateLoading || createLoading}
            >
              {(updateLoading || createLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingFaq ? 'Update FAQ' : 'Create FAQ'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default FaqPage;
