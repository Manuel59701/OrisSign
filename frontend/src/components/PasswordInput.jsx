import { useState } from 'react';
import { Eye, EyeOff } from './Icons';

export default function PasswordInput({ ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle-btn"
        title={visible ? 'Hide password' : 'Show password'}
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOff width="17" height="17" /> : <Eye width="17" height="17" />}
      </button>
    </div>
  );
}