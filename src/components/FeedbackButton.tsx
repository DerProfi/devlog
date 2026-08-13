'use client'

import { useState } from 'react'
import FeedbackModal from './FeedbackModal'
import { FaCommentAlt } from 'react-icons/fa'

export default function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 z-40"
        style={{
          background: 'linear-gradient(to right, var(--dl-accent), var(--dl-accent-2))',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        }}
        aria-label="Send feedback"
        title="Send feedback"
      >
        <FaCommentAlt className="text-white text-xl" />
      </button>

      {/* Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
