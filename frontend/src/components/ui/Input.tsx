import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrapper({ label, hint, error, required, children }: FieldWrapperProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500 mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  'w-full px-3 py-2 text-sm border rounded-lg transition-colors ' +
  'focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:ring-offset-0 ' +
  'disabled:bg-slate-50 disabled:text-slate-500';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, required, className, ...rest }: InputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <input
        {...rest}
        required={required}
        className={cn(
          inputBase,
          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300',
          className
        )}
      />
    </FieldWrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, required, className, ...rest }: TextareaProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <textarea
        {...rest}
        required={required}
        className={cn(
          inputBase,
          'resize-none',
          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300',
          className
        )}
      />
    </FieldWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({ label, hint, error, required, className, children, ...rest }: SelectProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <select
        {...rest}
        required={required}
        className={cn(
          inputBase,
          'bg-white',
          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300',
          className
        )}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}