import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
} from '@mui/material';

import { Email } from '@/lib/schema';

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (email: Partial<Email>) => Promise<void>;
}

export default function ComposeModal({ open, onClose, onSend }: ComposeModalProps) {
  const [formData, setFormData] = useState<Partial<Email>>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSend(formData);
      setFormData({ to: '', cc: '', bcc: '', subject: '', content: '' });
      onClose();
    } catch (error) {
      console.error('Failed to send email', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>New Message</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="To"
            fullWidth
            size="small"
            value={formData.to}
            onChange={handleChange('to')}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Cc"
              fullWidth
              size="small"
              value={formData.cc}
              onChange={handleChange('cc')}
            />
            <TextField
              label="Bcc"
              fullWidth
              size="small"
              value={formData.bcc}
              onChange={handleChange('bcc')}
            />
          </Box>
          <TextField
            label="Subject"
            fullWidth
            size="small"
            value={formData.subject}
            onChange={handleChange('subject')}
          />
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={12}
            value={formData.content}
            onChange={handleChange('content')}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.to}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
