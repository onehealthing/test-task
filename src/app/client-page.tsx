'use client';

import React, { useState, useEffect } from 'react';
import { Box, Chip, InputAdornment, TextField, Typography, Button } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import EmailCard from '@/components/EmailCard';
import EmailDetail from '@/components/EmailDetail';
import ComposeModal from '@/components/ComposeModal';
import { Email } from '@/lib/schema';

interface ClientPageProps {
  emails: Email[];
  currentFilter: string;
}

export default function ClientPage(props: ClientPageProps) {
  const { emails: emailList, currentFilter } = props;

  const router = useRouter();

  const unreadCount = emailList.filter(email => !email.isRead).length;
  const importantCount = emailList.filter(email => email.isImportant).length;

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedEmails, setDisplayedEmails] = useState<Email[]>(emailList);

  const handleSendEmail = async (data: Partial<Email>) => {
    await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.refresh();
  };

  const handleDeleteEmail = async (id: number) => {
    try {
      const response = await fetch('/api/emails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setDisplayedEmails(prev => prev.filter(email => email.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete email:', error);
    }
  };

  const handleRestoreEmail = async (id: number) => {
    try {
      const response = await fetch('/api/emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'restore' }),
      });

      if (response.ok) {
        setDisplayedEmails(prev => prev.filter(email => email.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to restore email:', error);
    }
  };

  const getTitle = () => {
    switch (currentFilter) {
    case 'sent':
      return 'Sent';
    case 'important':
      return 'Important';
    case 'trash':
      return 'Trash';
    default:
      return 'Inbox';
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setDisplayedEmails(emailList);
    }
  }, [emailList, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm) {
        try {
          const response = await fetch(`/api/emails?search=${encodeURIComponent(searchTerm)}&filter=${currentFilter}`);
          if (response.ok) {
            const data = await response.json();
            setDisplayedEmails(data);
          }
        } catch (error) {
          console.error('Error searching emails:', error);
        }
      } else {
        setDisplayedEmails(emailList);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, emailList, currentFilter]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Panel - Email List */}
      <Box sx={{
        width: '400px',
        borderRight: '1px solid',
        borderRightColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {getTitle()}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon/>}
              onClick={() => setIsComposeOpen(true)}
              size="small"
            >
              Compose
            </Button>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              label={`${displayedEmails.length} Total`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${unreadCount} Unread`}
              size="small"
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`${importantCount} Important`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search emails..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action"/>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default',
              },
            }}
          />
        </Box>

        {/* Email List - Scrollable */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          p: 1,
        }} data-testid="email-list">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {displayedEmails.map((email) => (
              <Box
                onClick={() => setSelectedEmail(email)}
                key={email.id}
                sx={{ cursor: 'pointer' }}
              >
                <EmailCard
                  key={email.id}
                  email={email}
                  onDelete={handleDeleteEmail}
                  onRestore={handleRestoreEmail}
                />
              </Box>
            ))}
            {displayedEmails.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                No emails found.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Right Panel - Email Content (Placeholder) */}
      <Box
        component="main"
        sx={{
          flex: 1,
          backgroundColor: 'background.default',
          overflow: 'hidden',
          position: 'relative',
        }}
        data-testid="email-content-panel"
      >
        <EmailDetail email={selectedEmail}/>
      </Box>

      <ComposeModal
        open={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendEmail}
      />
    </Box>
  );
}
