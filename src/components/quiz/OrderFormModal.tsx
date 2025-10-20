import { useState } from 'react';

interface OrderFormModalProps {
  bundle: string;
  price: number;
  diagnosis: string;
  onClose: () => void;
}

export default function OrderFormModal({ 
  bundle, 
  price, 
  diagnosis, 
  onClose 
}: OrderFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Complete Your Order</h2>
          <p className="modal-subtitle">
            You're ordering: <strong>{bundle}</strong>
          </p>
          <div className="order-summary">
            <div className="summary-row">
              <span>Your Diagnosis:</span>
              <span className="summary-value">{diagnosis}</span>
            </div>
            <div className="summary-row">
              <span>Recommended Bundle:</span>
              <span className="summary-value">{bundle}</span>
            </div>
            <div className="summary-row total">
              <span>Total (Pay on Delivery):</span>
              <span className="summary-value">₦{price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="modal-body">
          {/* YOUR EMBEDDED FORM GOES HERE */}
          <div className="embedded-form-container">
            {/* Option 1: If you have an iframe */}
            <iframe
              src="YOUR_FORM_URL_HERE"
              width="100%"
              height={600}
              frameBorder={0}
              title="Order Form"
              className="embedded-form-iframe"
            />

            {/* Option 2: If you have a form embed code */}
            {/* Paste your form embed code here */}
            
            {/* Option 3: If you need to build the form inline */}
            {/* See Option 3 in the task for inline form */}
          </div>
        </div>

        <div className="modal-footer">
          <p className="footer-note">
            🔒 Secure checkout • 📦 Delivery in 3-5 days • 💳 Pay when you receive it
          </p>
        </div>
      </div>
    </div>
  );
}
