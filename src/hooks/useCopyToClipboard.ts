import { notify } from '../utils/notifications';

export const useCopyToClipboard = () => {
  const copy = (text: string, successMessage: string = 'Copied to clipboard!') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    notify({ type: 'success', message: successMessage });
  };

  return { copy };
};
